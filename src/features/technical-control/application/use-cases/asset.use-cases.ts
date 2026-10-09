import { Injectable } from '@nestjs/common';
import type { AuditEntry } from '../../../../common/audit/audit-log.writer';
import type { Principal } from '../../../../common/auth/principal';
import {
  AWS_ROLE_ARN,
  ConnectionCategory,
  ConnectionMethodValue,
  DEFAULT_CRITICALITY,
  ResourceKindValue,
  ScheduleFrequencyValue,
} from '../../../../common/catalogs/technical-catalogs';
import { DomainError } from '../../../../common/errors/domain-error';
import { ValidationException } from '../../../../common/errors/validation.exception';
import { RequestMeta } from '../../../../common/http/request-meta';
import { Page, PageRequest } from '../../../../common/pagination/page';
import { CredentialCipher } from '../../../../common/security/credential-cipher';
import { TenantScope } from '../../../../common/tenancy/tenant-scope';
import { Asset, AssetEdit, AssetFilters, NewAsset, ResourceListing } from '../../domain/entities/technical-control.entities';
import { ConnectionProbe } from '../../domain/ports/connection-probe';
import { TechnicalControlRepository } from '../../domain/repositories/technical-control.repository';
import { normalizeCredentials } from '../credentials.validation';
import { checkCloudTarget, newExternalId, planConnection } from '../cloud-connection';

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
  // Nada de esto es secreto (las llaves, si las hay, nunca llegan al rastro).
  connection_method: a.provisioning.connectionMethod,
  external_account_id: a.externalAccountId,
  regions: a.provisioning.regions,
  role_arn: a.provisioning.roleArn,
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
  // Canal de conexión (D53). Sin él rige el formulario provisional del paso 3 (`credentials` por categoría), que se retira cuando la pantalla migre.
  connectionMethod?: ConnectionMethodValue;
  externalAccountId?: string | null;
  regions?: string[];
};

@Injectable()
export class CreateAssetUseCase {
  constructor(
    private readonly repo: TechnicalControlRepository,
    private readonly cipher: CredentialCipher,
  ) {}

  async execute(principal: Principal, request: NewAssetRequest, meta: RequestMeta): Promise<Asset> {
    const base = {
      name: request.name,
      connectionCategory: request.connectionCategory,
      ipAddress: request.ipAddress,
      location: request.location,
      criticality: request.criticality ?? DEFAULT_CRITICALITY,
      tags: request.tags ?? [],
      serviceIds: request.serviceIds,
      responsibleId: request.responsibleId,
    };
    let input: NewAsset;
    if (request.connectionMethod) {
      // Con canal de conexión: cuenta y regiones declaradas, ExternalId que genera Monkey y llaves cifradas solo en el canal de llaves.
      const { errors, plan } = planConnection({
        connectionCategory: request.connectionCategory,
        platform: request.platform,
        connectionMethod: request.connectionMethod,
        externalAccountId: request.externalAccountId,
        regions: request.regions,
        credentials: request.credentials,
      });
      if (errors.length > 0 || !plan) throw new ValidationException(errors);
      input = {
        ...base,
        platform: plan.platform,
        encryptedCredentials: plan.secretToStore ? this.cipher.encrypt(plan.secretToStore) : null,
        connectionMethod: plan.method,
        externalAccountId: plan.externalAccountId,
        regions: plan.regions,
        externalId: plan.externalId,
      };
    } else {
      const { errors, toStore } = normalizeCredentials(request.connectionCategory, request.credentials);
      if (errors.length > 0) throw new ValidationException(errors);
      input = {
        ...base,
        platform: request.platform,
        encryptedCredentials: toStore ? this.cipher.encrypt(toStore) : null,
        connectionMethod: null,
        externalAccountId: null,
        regions: [],
        externalId: null,
      };
    }

    return this.repo.createAsset(
      scopeOf(principal),
      input,
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
    // Una conexión activa o programada también se puede volver a comprobar (refresca los activos encontrados), pero su estado no cambia.

    // La sonda corre FUERA de la transacción de base de datos, y las credenciales descifradas solo
    // viven en esta variable. Sin sonda disponible lanza CONNECTION_UNAVAILABLE y no cambia nada.
    // Con la sonda del trabajador (`runner`) el backend NO descifra nada: es el trabajador quien lee la conexión.
    const credentials = target.encryptedCredentials && this.probe.mode !== 'runner' ? this.cipher.decrypt(target.encryptedCredentials) : null;
    const result = await this.probe.validate({
      assetId: id,
      companyId: principal.companyId,
      actorUserId: principal.userId,
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

// El cliente entrega el ARN del rol de solo lectura que creó con la plantilla. No es un secreto, pero se valida: forma de ARN y que sea de la cuenta
// declarada (un rol de otra cuenta jamás se evalúa).
@Injectable()
export class SetAssetConnectionUseCase {
  constructor(private readonly repo: TechnicalControlRepository) {}

  async execute(principal: Principal, id: string, roleArn: string, meta: RequestMeta): Promise<Asset> {
    const scope = scopeOf(principal);
    const asset = await this.repo.findAsset(scope, id);
    if (!asset) throw new DomainError('NOT_FOUND');
    const arn = roleArn.trim();
    const match = AWS_ROLE_ARN.exec(arn);
    if (!match) throw new ValidationException([{ field: 'role_arn', code: 'invalid' }]);
    if (asset.externalAccountId && match[1] !== asset.externalAccountId) throw new ValidationException([{ field: 'role_arn', code: 'connection.account_mismatch' }]);
    const { after } = await this.repo.setConnection(scope, id, arn, (c) => assetEntry({ principal, meta, action: 'asset.connection_set', before: c.before, after: c.after }));
    return after;
  }
}

export type AssetUpdateRequest = {
  name?: string;
  criticality?: string;
  tags?: string[];
  externalAccountId?: string;
  regions?: string[];
  roleArn?: string;
  credentials?: Record<string, unknown>;
};

const sameSet = (a: string[], b: string[]): boolean => a.length === b.length && a.every((x) => b.includes(x));

// Editar un sistema. Nombre, criticidad y etiquetas se cambian sin más. Lo que se evalúa (cuenta, regiones, rol, llaves) solo se edita en la nube
// y, si cambia, la conexión vuelve a «pendiente»: lo que ya se comprobó no vale para lo nuevo.
@Injectable()
export class UpdateAssetUseCase {
  constructor(
    private readonly repo: TechnicalControlRepository,
    private readonly cipher: CredentialCipher,
  ) {}

  async execute(principal: Principal, id: string, request: AssetUpdateRequest, meta: RequestMeta): Promise<Asset> {
    const scope = scopeOf(principal);
    const asset = await this.repo.findAsset(scope, id);
    if (!asset) throw new DomainError('NOT_FOUND');
    const edit: AssetEdit = { resetsConnection: false };
    if (request.name !== undefined) edit.name = request.name;
    if (request.criticality !== undefined) edit.criticality = request.criticality;
    if (request.tags !== undefined) edit.tags = request.tags;

    const touchesConnection = [request.externalAccountId, request.regions, request.roleArn, request.credentials].some((v) => v !== undefined);
    if (touchesConnection) {
      const method = asset.provisioning.connectionMethod;
      if (asset.connectionCategory !== 'ac_01' || !method || method === 'agent') {
        throw new ValidationException([{ field: 'connection', code: 'field.not_allowed' }]);
      }
      const account = request.externalAccountId ?? asset.externalAccountId;
      const regions = request.regions ?? asset.provisioning.regions;
      const errors = checkCloudTarget(account, regions).errors;

      if (request.credentials !== undefined) {
        // Solo el canal de llaves las admite; planConnection valida su forma y rechaza `credentials` en el canal de rol.
        const { errors: credentialErrors, plan } = planConnection({ connectionCategory: asset.connectionCategory, platform: asset.platform, connectionMethod: method, externalAccountId: account, regions, credentials: request.credentials });
        errors.push(...credentialErrors.filter((e) => e.field.startsWith('credentials')));
        if (plan?.secretToStore) edit.encryptedCredentials = this.cipher.encrypt(plan.secretToStore);
      }
      let roleArn: string | null | undefined = request.roleArn?.trim();
      if (request.roleArn !== undefined) {
        if (method !== 'readonly_role') throw new DomainError('CONNECTION_METHOD_NOT_APPLICABLE');
        const match = AWS_ROLE_ARN.exec(roleArn as string);
        if (!match) errors.push({ field: 'role_arn', code: 'invalid' });
        else if (account && match[1] !== account) errors.push({ field: 'role_arn', code: 'connection.account_mismatch' });
      }
      if (errors.length > 0) throw new ValidationException(errors);

      const accountChanged = request.externalAccountId !== undefined && request.externalAccountId !== asset.externalAccountId;
      const regionsChanged = request.regions !== undefined && !sameSet(request.regions, asset.provisioning.regions);
      const roleChanged = roleArn !== undefined && roleArn !== asset.provisioning.roleArn;
      if (accountChanged) {
        edit.externalAccountId = account as string;
        // El rol y el ExternalId eran de la cuenta anterior: el rol se descarta salvo que llegue uno nuevo, y el ExternalId se renueva.
        if (method === 'readonly_role') {
          edit.externalId = newExternalId();
          if (roleArn === undefined) roleArn = null;
        }
      }
      if (regionsChanged) edit.regions = request.regions;
      if (roleArn !== undefined && (roleChanged || accountChanged)) edit.roleArn = roleArn;
      edit.resetsConnection = accountChanged || regionsChanged || roleChanged || edit.encryptedCredentials !== undefined;
    }

    const { after } = await this.repo.updateAsset(scope, id, edit, (c) => assetEntry({ principal, meta, action: 'asset.update', before: c.before, after: c.after }));
    return after;
  }
}

// Dar de baja un sistema. No borra nada: el historial de evaluaciones es evidencia y se conserva; el sistema deja de listarse y de evaluarse.
@Injectable()
export class RetireAssetUseCase {
  constructor(private readonly repo: TechnicalControlRepository) {}

  async execute(principal: Principal, id: string, meta: RequestMeta): Promise<void> {
    await this.repo.retireAsset(scopeOf(principal), id, (c) => assetEntry({ principal, meta, action: 'asset.retire', before: c.before, after: c.after }));
  }
}

// Lo que la conexión reconoció en la cuenta del cliente (D59): sus activos, por clase y con lo que se pudo leer de cada uno.
@Injectable()
export class ListAssetResourcesUseCase {
  constructor(private readonly repo: TechnicalControlRepository) {}

  async execute(principal: Principal, id: string, filter: { kind?: ResourceKindValue }, page: PageRequest): Promise<ResourceListing> {
    const listing = await this.repo.listResources(scopeOf(principal), id, filter, page);
    if (!listing) throw new DomainError('NOT_FOUND');
    return listing;
  }
}
