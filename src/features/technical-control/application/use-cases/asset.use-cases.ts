import { Injectable } from '@nestjs/common';
import type { AuditEntry } from '../../../../common/audit/audit-log.writer';
import type { Principal } from '../../../../common/auth/principal';
import {
  ConnectionCategory,
  DEFAULT_CRITICALITY,
  ScheduleFrequencyValue,
} from '../../../../common/catalogs/technical-catalogs';
import { DomainError } from '../../../../common/errors/domain-error';
import { ValidationException } from '../../../../common/errors/validation.exception';
import { RequestMeta } from '../../../../common/http/request-meta';
import { Page, PageRequest } from '../../../../common/pagination/page';
import { CredentialCipher } from '../../../../common/security/credential-cipher';
import { TenantScope } from '../../../../common/tenancy/tenant-scope';
import { Asset, AssetFilters } from '../../domain/entities/technical-control.entities';
import { ConnectionProbe } from '../../domain/ports/connection-probe';
import { TechnicalControlRepository } from '../../domain/repositories/technical-control.repository';
import { normalizeCredentials } from '../credentials.validation';

const scopeOf = (p: Principal): TenantScope => ({ companyId: p.companyId, userId: p.userId, role: p.role });

// Forma para el audit trail (CC9.2). NUNCA lleva credenciales.
const snapshot = (a: Asset): Record<string, unknown> => ({
  id: a.id,
  code: a.code,
  name: a.name,
  connection_category: a.connectionCategory,
  type: a.type,
  platform: a.platform,
  service_ids: a.services.map((s) => s.id),
  connection_status: a.provisioning.connectionStatus,
  is_active: a.provisioning.isActive,
  operational_status: a.operationalStatus,
  schedule_frequency: a.provisioning.scheduleFrequency,
});

type Audited = { principal: Principal; meta: RequestMeta; action: string; before: Asset | null; after: Asset | null; result?: 'success' | 'error' };

// El rastro de un activo. Cada caso de uso lo entrega al repositorio como `AuditIntent` para que se escriba en la
// misma transacción que el cambio (SEG-36).
const assetEntry = ({ principal, meta, action, before, after, result = 'success' }: Audited): AuditEntry => ({
  tenantId: principal.companyId,
  userId: principal.userId,
  action,
  resource: 'asset',
  result,
  ipAddress: meta.ipAddress,
  userAgent: meta.userAgent,
  beforeState: before ? snapshot(before) : null,
  afterState: after ? snapshot(after) : null,
});

export type NewAssetRequest = {
  name: string;
  connectionCategory: ConnectionCategory;
  platform: string;
  ipAddress: string | null;
  location: string | null;
  criticality?: string;
  tags?: string[];
  serviceIds: string[];
  responsibleId: string | null;
  credentials?: Record<string, unknown>;
};

@Injectable()
export class CreateAssetUseCase {
  constructor(
    private readonly repo: TechnicalControlRepository,
    private readonly cipher: CredentialCipher,
  ) {}

  async execute(principal: Principal, request: NewAssetRequest, meta: RequestMeta): Promise<Asset> {
    const { errors, toStore } = normalizeCredentials(request.connectionCategory, request.credentials);
    if (errors.length > 0) throw new ValidationException(errors);

    return this.repo.createAsset(
      scopeOf(principal),
      {
      name: request.name,
      connectionCategory: request.connectionCategory,
      platform: request.platform,
      ipAddress: request.ipAddress,
      location: request.location,
      criticality: request.criticality ?? DEFAULT_CRITICALITY,
      tags: request.tags ?? [],
      serviceIds: request.serviceIds,
      responsibleId: request.responsibleId,
      encryptedCredentials: toStore ? this.cipher.encrypt(toStore) : null,
      },
      (asset) => assetEntry({ principal, meta, action: 'asset.create', before: null, after: asset }),
    );
  }
}

@Injectable()
export class ListAssetsUseCase {
  constructor(private readonly repo: TechnicalControlRepository) {}

  execute(principal: Principal, filters: AssetFilters, page: PageRequest): Promise<Page<Asset>> {
    return this.repo.listAssets(scopeOf(principal), filters, page);
  }
}

@Injectable()
export class GetAssetUseCase {
  constructor(private readonly repo: TechnicalControlRepository) {}

  async execute(principal: Principal, id: string): Promise<Asset> {
    const asset = await this.repo.findAsset(scopeOf(principal), id);
    if (!asset) throw new DomainError('NOT_FOUND');
    return asset;
  }
}

export type ValidationOutcome = { asset: Asset; checksAvailable: number };

@Injectable()
export class ValidateAssetUseCase {
  constructor(
    private readonly repo: TechnicalControlRepository,
    private readonly probe: ConnectionProbe,
    private readonly cipher: CredentialCipher,
  ) {}

  async execute(principal: Principal, id: string, meta: RequestMeta): Promise<ValidationOutcome> {
    const scope = scopeOf(principal);
    const target = await this.repo.findProbeTarget(scope, id);
    if (!target) throw new DomainError('NOT_FOUND');
    if (target.connectionStatus === 'active' || target.connectionStatus === 'scheduled') {
      throw new DomainError('ASSET_ALREADY_ACTIVE');
    }

    // La sonda corre FUERA de la transacción de base de datos, y las credenciales descifradas solo
    // viven en esta variable. Sin sonda disponible lanza CONNECTION_UNAVAILABLE y no cambia nada.
    const credentials = target.encryptedCredentials ? this.cipher.decrypt(target.encryptedCredentials) : null;
    const result = await this.probe.validate({
      category: target.category,
      platform: target.platform,
      ipAddress: target.ipAddress,
      credentials,
    });

    if (!result.ok) {
      // La validación fallida también cambia el estado de la conexión: su rastro va en la misma transacción.
      await this.repo.recordValidation(scope, id, { ok: false }, (c) =>
        assetEntry({ principal, meta, action: 'asset.validate', before: c.before, after: c.after, result: 'error' }),
      );
      throw new ValidationException(result.fields, { code: 'CONNECTION_FAILED', messageKey: 'asset.connection_failed' });
    }
    const { after } = await this.repo.recordValidation(
      scope,
      id,
      { ok: true, technicalCoverage: result.technicalCoverage },
      (c) => assetEntry({ principal, meta, action: 'asset.validate', before: c.before, after: c.after }),
    );
    return { asset: after, checksAvailable: result.checksAvailable };
  }
}

@Injectable()
export class ActivateAssetUseCase {
  constructor(
    private readonly repo: TechnicalControlRepository,
    private readonly probe: ConnectionProbe,
  ) {}

  async execute(principal: Principal, id: string, meta: RequestMeta): Promise<Asset> {
    // «Automatizado ≠ Operativo»: solo una sonda real puede decir que el activo opera. Con la
    // simulada (demostración) queda en `warning` y la pantalla lo explica.
    const { after } = await this.repo.activateAsset(
      scopeOf(principal),
      id,
      this.probe.confirmsOperation ? 'operational' : 'warning',
      (c) => assetEntry({ principal, meta, action: 'asset.activate', before: c.before, after: c.after }),
    );
    return after;
  }
}

@Injectable()
export class ScheduleAssetUseCase {
  constructor(private readonly repo: TechnicalControlRepository) {}

  async execute(principal: Principal, id: string, frequency: ScheduleFrequencyValue, meta: RequestMeta): Promise<Asset> {
    const { after } = await this.repo.scheduleAsset(scopeOf(principal), id, frequency, (c) =>
      assetEntry({ principal, meta, action: 'asset.schedule', before: c.before, after: c.after }),
    );
    return after;
  }
}
