import { randomBytes } from 'node:crypto';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { platformAppUrl } from '../../../../common/mail/app-url';
import { DomainError } from '../../../../common/errors/domain-error';
import { ValidationException } from '../../../../common/errors/validation.exception';
import { M365_GUID } from '../../../../common/catalogs/technical-catalogs';
import { Principal } from '../../../../common/auth/principal';
import { RequestMeta } from '../../../../common/http/request-meta';
import { ConsentTickets, MicrosoftIdentityVerifier } from '../../domain/ports/microsoft-consent';
import { Asset } from '../../domain/entities/technical-control.entities';
import { TechnicalControlRepository } from '../../domain/repositories/technical-control.repository';
import { assetEntry, scopeOf } from './asset.use-cases';

// D157 · «Conectar Microsoft 365» con un botón. El riesgo a cerrar: con una sola aplicación de Monkey autorizada por muchas empresas, quien lograra enlazar el tenant de OTRA a su
// cuenta la vería. Por eso:
//  1. La organización NUNCA sale de un parámetro de la dirección: sale de una identidad firmada por Microsoft (paso 1), de alguien que la administra.
//  2. La autorización (paso 2) debe ser de esa misma organización.
//  3. Solo termina la conexión la MISMA sesión de Monkey que la empezó (paso 3): si alguien le manda su enlace a un administrador ajeno, ese administrador vuelve sin esa sesión,
//     y quien lo envió no recibe nunca el recibo final.
const AUTHORITY = 'https://login.microsoftonline.com';
// Los dos roles de Microsoft Entra que pueden aprobar permisos de aplicación: Administrador global y Administrador de roles con privilegios.
export const MICROSOFT_APPROVER_ROLES = ['62e90394-69f5-4237-9190-012177145e10', 'e8611ab8-c189-46e8-94e1-60213ab1f814'];
// La organización de las cuentas personales de Microsoft: no es una empresa.
const CONSUMER_TENANT = '9188040d-6c67-4c5b-b112-36a304b66dad';
const SIGNIN_TTL = 10 * 60;
const CONSENT_TTL = 15 * 60;
const COMPLETE_TTL = 5 * 60;
// A dónde vuelve el navegador en Monkey. La pantalla lee `m365` (el recibo) o `m365_error`.
export const PLATFORM_RETURN_PATH = '/integraciones/microsoft';

export type ConsentError = 'cancelled' | 'expired' | 'not_admin' | 'personal_account' | 'identity_rejected' | 'unavailable';

export type MicrosoftAppSettings = { clientId: string; callbackBase: string; platformUrl: string };

// Sin la aplicación de Monkey registrada y configurada no hay botón: «no disponible», nunca un recorrido a medias.
export function readMicrosoftApp(config: ConfigService): MicrosoftAppSettings | null {
  const clientId = config.get<string>('M365_APP_CLIENT_ID')?.trim();
  const callbackBase = config.get<string>('M365_CALLBACK_BASE_URL')?.trim().replace(/\/+$/, '');
  const platformUrl = platformAppUrl(config)?.replace(/\/+$/, '');
  if (!clientId || !M365_GUID.test(clientId) || !callbackBase || !/^https?:\/\//.test(callbackBase) || !platformUrl) return null;
  return { clientId, callbackBase, platformUrl };
}

export const signinCallbackUrl = (app: MicrosoftAppSettings): string => `${app.callbackBase}/integrations/microsoft/signin`;
export const consentCallbackUrl = (app: MicrosoftAppSettings): string => `${app.callbackBase}/integrations/microsoft/consent`;
const platformReturn = (app: MicrosoftAppSettings, params: Record<string, string>): string => `${app.platformUrl}${PLATFORM_RETURN_PATH}?${new URLSearchParams(params).toString()}`;

@Injectable()
export class StartMicrosoftConsentUseCase {
  constructor(
    private readonly repo: TechnicalControlRepository,
    private readonly tickets: ConsentTickets,
    private readonly config: ConfigService,
  ) {}

  async execute(principal: Principal, assetId: string): Promise<{ authorizeUrl: string }> {
    const asset = await this.repo.findAsset(scopeOf(principal), assetId);
    if (!asset) throw new DomainError('NOT_FOUND');
    if (asset.provisioning.connectionMethod !== 'admin_consent') throw new DomainError('CONNECTION_METHOD_NOT_APPLICABLE');
    if (asset.provisioning.isActive) throw new DomainError('ASSET_ALREADY_ACTIVE');
    const app = readMicrosoftApp(this.config);
    if (!app) throw new DomainError('CONNECTION_UNAVAILABLE');
    const nonce = randomBytes(16).toString('hex');
    const state = this.tickets.sign({ step: 'signin', companyId: principal.companyId, userId: principal.userId, assetId, nonce }, SIGNIN_TTL);
    const query = new URLSearchParams({
      client_id: app.clientId,
      response_type: 'id_token',
      response_mode: 'form_post',
      redirect_uri: signinCallbackUrl(app),
      scope: 'openid profile',
      nonce,
      state,
      prompt: 'select_account',
    });
    return { authorizeUrl: `${AUTHORITY}/organizations/oauth2/v2.0/authorize?${query.toString()}` };
  }
}

// Paso 1 de vuelta: Microsoft entrega la identidad firmada. Devuelve a dónde mandar el navegador.
@Injectable()
export class MicrosoftSignedInUseCase {
  constructor(
    private readonly tickets: ConsentTickets,
    private readonly verifier: MicrosoftIdentityVerifier,
    private readonly config: ConfigService,
  ) {}

  async execute(input: { state: string; idToken: string; error: string }): Promise<string> {
    const app = readMicrosoftApp(this.config);
    if (!app) throw new DomainError('CONNECTION_UNAVAILABLE');
    const fail = (error: ConsentError, assetId?: string) => platformReturn(app, { m365_error: error, ...(assetId ? { asset: assetId } : {}) });
    const ticket = this.tickets.verify(input.state, 'signin');
    if (!ticket?.nonce) return fail('expired');
    if (input.error || !input.idToken) return fail('cancelled', ticket.assetId);
    let identity;
    try {
      identity = await this.verifier.verify(input.idToken, { clientId: app.clientId, nonce: ticket.nonce });
    } catch {
      return fail('unavailable', ticket.assetId);
    }
    if (!identity || !M365_GUID.test(identity.tenantId)) return fail('identity_rejected', ticket.assetId);
    const tenantId = identity.tenantId.toLowerCase();
    if (tenantId === CONSUMER_TENANT) return fail('personal_account', ticket.assetId);
    if (!identity.directoryRoles.some((r) => MICROSOFT_APPROVER_ROLES.includes(r.toLowerCase()))) return fail('not_admin', ticket.assetId);
    const state = this.tickets.sign({ step: 'consent', companyId: ticket.companyId, userId: ticket.userId, assetId: ticket.assetId, tenantId }, CONSENT_TTL);
    const query = new URLSearchParams({ client_id: app.clientId, scope: 'https://graph.microsoft.com/.default', redirect_uri: consentCallbackUrl(app), state });
    return `${AUTHORITY}/${tenantId}/v2.0/adminconsent?${query.toString()}`;
  }
}

// Paso 2 de vuelta: el administrador autorizó (o no). El `tenant` de la dirección solo se COMPARA con el comprobado en el paso 1.
@Injectable()
export class MicrosoftConsentedUseCase {
  constructor(
    private readonly tickets: ConsentTickets,
    private readonly config: ConfigService,
  ) {}

  execute(input: { state: string; tenant: string; adminConsent: string; error: string }): string {
    const app = readMicrosoftApp(this.config);
    if (!app) throw new DomainError('CONNECTION_UNAVAILABLE');
    const ticket = this.tickets.verify(input.state, 'consent');
    if (!ticket?.tenantId) return platformReturn(app, { m365_error: 'expired' });
    if (input.error || input.adminConsent.toLowerCase() !== 'true') return platformReturn(app, { m365_error: 'cancelled', asset: ticket.assetId });
    if (input.tenant.toLowerCase() !== ticket.tenantId) return platformReturn(app, { m365_error: 'identity_rejected', asset: ticket.assetId });
    const handle = this.tickets.sign({ step: 'complete', companyId: ticket.companyId, userId: ticket.userId, assetId: ticket.assetId, tenantId: ticket.tenantId }, COMPLETE_TTL);
    return platformReturn(app, { m365: handle, asset: ticket.assetId });
  }
}

// Paso 3: la pantalla, con la sesión de quien empezó, entrega el recibo. Aquí el activo queda enlazado a la organización comprobada.
@Injectable()
export class CompleteMicrosoftConsentUseCase {
  constructor(
    private readonly repo: TechnicalControlRepository,
    private readonly tickets: ConsentTickets,
  ) {}

  async execute(principal: Principal, assetId: string, handle: string, meta: RequestMeta): Promise<Asset> {
    const ticket = this.tickets.verify(handle, 'complete');
    const mine = ticket && ticket.companyId === principal.companyId && ticket.userId === principal.userId && ticket.assetId === assetId;
    if (!mine || !ticket.tenantId) throw new ValidationException([{ field: 'handle', code: 'connection.consent_invalid' }]);
    const { after } = await this.repo.linkMicrosoftTenant(scopeOf(principal), assetId, ticket.tenantId, (c) => assetEntry({ principal, meta, action: 'asset.connection_set', before: c.before, after: c.after }));
    return after;
  }
}
