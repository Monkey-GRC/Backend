import { Body, Controller, Get, HttpCode, HttpStatus, Inject, Post, Req, Res } from '@nestjs/common';
import { ApiExtraModels, ApiOperation, ApiTags } from '@nestjs/swagger';
import type { Request, Response } from 'express';
import { I18nContext } from 'nestjs-i18n';
import type { Principal } from '../../../common/auth/principal';
import { CurrentUser } from '../../../common/decorators/current-user.decorator';
import { Public } from '../../../common/decorators/public.decorator';
import { ResponseDto } from '../../../common/dtos/response.dto';
import type { SessionPolicy } from '../domain/entities/session.entity';
import { ActivateAccountDto, LookupActivationCodeDto } from '../application/dtos/activation.dto';
import { LoginDto } from '../application/dtos/login.dto';
import { MfaCodeDto, VerifyMfaDto } from '../application/dtos/mfa.dto';
import { LookupAccessKeyDto } from '../application/dtos/lookup-access-key.dto';
import { RedeemAccessKeyDto } from '../application/dtos/redeem-access-key.dto';
import { SESSION_POLICY } from '../application/session-policy.token';
import { ActivateAccountUseCase } from '../application/use-cases/activation/activate-account.use-case';
import { GetCurrentUserUseCase } from '../application/use-cases/session/get-current-user.use-case';
import { GetOnboardingProgressUseCase } from '../application/use-cases/session/get-onboarding-progress.use-case';
import { ConfirmMfaSetupUseCase } from '../application/use-cases/mfa/confirm-mfa-setup.use-case';
import { LoginUseCase } from '../application/use-cases/session/login.use-case';
import { LogoutUseCase } from '../application/use-cases/session/logout.use-case';
import { LookupActivationCodeUseCase } from '../application/use-cases/activation/lookup-activation-code.use-case';
import { LookupAccessKeyUseCase } from '../application/use-cases/access-key/lookup-access-key.use-case';
import { RedeemAccessKeyUseCase } from '../application/use-cases/access-key/redeem-access-key.use-case';
import { RefreshSessionUseCase } from '../application/use-cases/session/refresh-session.use-case';
import { RegenerateRecoveryCodesUseCase } from '../application/use-cases/mfa/regenerate-recovery-codes.use-case';
import { StartMfaSetupUseCase } from '../application/use-cases/mfa/start-mfa-setup.use-case';
import { VerifyMfaUseCase } from '../application/use-cases/mfa/verify-mfa.use-case';
import {
  clearAuthCookies,
  clearMfaChallengeCookie,
  MFA_COOKIE,
  readCookie,
  REFRESH_COOKIE,
  requestMeta,
  setAuthCookies,
  setMfaChallengeCookie,
} from './auth-cookies';
import { toAuthResponse } from './auth-response.mapper';
import { API_TAGS } from '../../../common/swagger/api-docs.config';
import { ApiData, ApiDomainErrors, ApiEmpty, ApiNoBody } from '../../../common/swagger/api-envelope';
import { AccessKeyLookupResponse, ActivationLookupResponse, AuthSessionResponse, AuthSessionWithRecoveryResponse, MfaSetupStartResponse, MfaStepResponse, RecoveryCodesResponse } from './auth.responses';

const t = (key: string): string =>
  (I18nContext.current()?.t(key) as string | undefined) ?? key;

// Lo que se contesta cuando falta el segundo factor: qué sigue (verificar o configurar) y hasta cuándo sirve el desafío.
const mfaStep = (challenge: { purpose: 'verify' | 'setup'; expiresAt: Date }) => ({
  next_step: challenge.purpose === 'verify' ? 'mfa_verify' : 'mfa_setup',
  expires_at: challenge.expiresAt.toISOString(),
});

@ApiTags(API_TAGS.auth)
@ApiExtraModels(MfaStepResponse)
@Controller('auth')
export class AuthController {
  constructor(
    private readonly login: LoginUseCase,
    private readonly refresh: RefreshSessionUseCase,
    private readonly logout: LogoutUseCase,
    private readonly getCurrentUser: GetCurrentUserUseCase,
    private readonly lookupActivationCode: LookupActivationCodeUseCase,
    private readonly activateAccount: ActivateAccountUseCase,
    private readonly redeemAccessKey: RedeemAccessKeyUseCase,
    private readonly lookupAccessKey: LookupAccessKeyUseCase,
    private readonly getOnboardingProgress: GetOnboardingProgressUseCase,
    private readonly verifyMfa: VerifyMfaUseCase,
    private readonly startMfaSetup: StartMfaSetupUseCase,
    private readonly confirmMfaSetup: ConfirmMfaSetupUseCase,
    private readonly regenerateCodes: RegenerateRecoveryCodesUseCase,
    @Inject(SESSION_POLICY) private readonly policy: SessionPolicy,
  ) {}

  @Public()
  @ApiOperation({ summary: 'Iniciar sesión', description: 'Valida el correo y la contraseña y abre la sesión: el servidor deja las cookies `httpOnly` `mnk_access` (15 min) y `mnk_refresh` en la respuesta. Nunca revela cuál de los dos datos falló. **Con el segundo factor (D94) la contraseña correcta no abre la sesión:** responde `data.next_step` (`mfa_verify` o `mfa_setup`) y deja la cookie `mnk_mfa` (el desafío, 5 minutos); la sesión se abre en `POST /auth/mfa/verify` o `POST /auth/mfa/setup/confirm`. La sesión cierra a los 30 min sin actividad y a las 8 h de abierta; a los 5 intentos fallidos la cuenta se bloquea 15 min.' })
  @ApiData(AuthSessionResponse, 'Sesión abierta. Trae el usuario, su empresa y, para `admin_empresa`, el avance del onboarding.')
  @ApiDomainErrors('INVALID_CREDENTIALS', 'ACCOUNT_LOCKED', 'ACCOUNT_INACTIVE')
  @Post('login')
  @HttpCode(HttpStatus.OK)
  async signIn(
    @Body() dto: LoginDto,
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
  ) {
    const result = await this.login.execute(dto.email, dto.password, requestMeta(req));
    if (result.kind === 'mfa') {
      setMfaChallengeCookie(res, result.challenge.token, result.challenge.expiresAt);
      return new ResponseDto(HttpStatus.OK, t(result.challenge.purpose === 'verify' ? 'auth.mfa_required' : 'auth.mfa_setup_required'), mfaStep(result.challenge));
    }
    setAuthCookies(res, result, this.policy.accessTokenTtl, result.session.expiresAt);
    const onboarding = await this.getOnboardingProgress.execute(result.user);
    return new ResponseDto(HttpStatus.OK, t('auth.logged_in'), toAuthResponse(result.user, onboarding));
  }

  // Primer paso de la activación (D51): con el código, muestra la empresa y el correo ya fijados por
  // Monkey Admin. No gasta la clave ni crea nada.
  @Public()
  @ApiOperation({ summary: 'Comprobar una clave de acceso (paso 1 de la activación)', description: 'Con el código que Monkey entregó al cliente, muestra la razón social y el correo administrativo ya fijados. **No gasta la clave ni crea nada.** Los intentos fallidos se auditan y cuentan para el límite de 10 por dirección cada 15 minutos, compartido con el canje.' })
  @ApiData(AccessKeyLookupResponse, 'La clave se puede canjear. Estos datos se muestran bloqueados en la pantalla de activación.')
  @ApiDomainErrors('ACCESS_KEY_INVALID', 'ACCESS_KEY_ALREADY_USED', 'ACCESS_KEY_EXPIRED', 'ACCESS_KEY_RATE_LIMITED')
  @Post('redeem/lookup')
  @HttpCode(HttpStatus.OK)
  async lookup(@Body() dto: LookupAccessKeyDto, @Req() req: Request) {
    const found = await this.lookupAccessKey.execute(dto.code, requestMeta(req));
    return new ResponseDto(HttpStatus.OK, t('auth.access_key_found'), {
      company: { name: found.companyName },
      admin_email: found.adminEmail,
      expires_at: found.expiresAt.toISOString(),
    });
  }

  // Primer acceso del cliente: canjea la clave, crea su cuenta admin_empresa y abre sesión.
  @Public()
  @ApiOperation({ summary: 'Canjear la clave y crear la cuenta del administrador (paso 2)', description: 'Primer acceso del cliente. Crea la cuenta `admin_empresa` con el correo administrativo registrado y la contraseña indicada, gasta la clave (un solo uso) y abre la sesión con las mismas cookies que el login. La contraseña debe tener 12 o más caracteres con mayúscula, minúscula, número y símbolo.' })
  @ApiData(AuthSessionResponse, 'Cuenta creada y sesión abierta. `onboarding.next_step` es `organizational_context`.', { status: 201 })
  @ApiDomainErrors('ACCESS_KEY_INVALID', 'ACCESS_KEY_ALREADY_USED', 'ACCESS_KEY_EXPIRED', 'EMAIL_TAKEN', 'ACCESS_KEY_EMAIL_MISMATCH', 'ACCESS_KEY_RATE_LIMITED')
  @Post('redeem')
  @HttpCode(HttpStatus.CREATED)
  async redeem(
    @Body() dto: RedeemAccessKeyDto,
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
  ) {
    const result = await this.redeemAccessKey.execute(
      {
        code: dto.code,
        email: dto.email,
        password: dto.password,
      },
      requestMeta(req),
    );
    // D94 · Con el segundo factor obligatorio, la cuenta recién creada lo configura antes de entrar.
    if (result.kind === 'mfa') {
      setMfaChallengeCookie(res, result.challenge.token, result.challenge.expiresAt);
      return new ResponseDto(HttpStatus.CREATED, t('auth.mfa_setup_required'), mfaStep(result.challenge));
    }
    setAuthCookies(res, result, this.policy.accessTokenTtl, result.session.expiresAt);
    const onboarding = await this.getOnboardingProgress.execute(result.user);
    return new ResponseDto(HttpStatus.CREATED, t('auth.account_created'), toAuthResponse(result.user, onboarding));
  }

  // ── Segundo factor (D94) ───────────────────────────────────────────────────────────────────────────────────────────────────────────
  @Public()
  @ApiOperation({ summary: 'Verificar el segundo factor y abrir la sesión', description: 'Segundo paso del ingreso de quien ya tiene el segundo factor. Con la cookie `mnk_mfa` (la deja el login) y el código de 6 dígitos de su app —o uno de sus códigos de recuperación— abre la sesión con las mismas cookies del login. Un código equivocado cuenta como un intento fallido más: suma al bloqueo de la cuenta (5 intentos, 15 min) y al del desafío (5 intentos). Un código ya usado no sirve otra vez.' })
  @ApiData(AuthSessionWithRecoveryResponse, 'Sesión abierta. Si entró con un código de recuperación, trae `recovery_codes_left`.')
  @ApiDomainErrors('MFA_CHALLENGE_INVALID', 'MFA_CODE_INVALID', 'ACCOUNT_LOCKED', 'ACCOUNT_INACTIVE')
  @Post('mfa/verify')
  @HttpCode(HttpStatus.OK)
  async verify(@Body() dto: VerifyMfaDto, @Req() req: Request, @Res({ passthrough: true }) res: Response) {
    const result = await this.verifyMfa.execute({ challengeToken: readCookie(req, MFA_COOKIE), code: dto.code, recoveryCode: dto.recovery_code }, requestMeta(req));
    clearMfaChallengeCookie(res);
    setAuthCookies(res, result, this.policy.accessTokenTtl, result.session.expiresAt);
    const onboarding = await this.getOnboardingProgress.execute(result.user);
    return new ResponseDto(HttpStatus.OK, t('auth.logged_in'), {
      ...toAuthResponse(result.user, onboarding),
      ...(result.method === 'recovery' ? { recovery_codes_left: result.recoveryCodesLeft } : {}),
    });
  }

  @Public()
  @ApiOperation({ summary: 'Pedir el QR para configurar el segundo factor', description: 'Primer ingreso: con la cookie `mnk_mfa` de un desafío de configuración devuelve el secreto y la dirección `otpauth://` para dibujar el QR en el navegador. El secreto queda cifrado en el desafío, no en el usuario, hasta que se confirme; si se vuelve a pedir, devuelve el mismo.' })
  @ApiData(MfaSetupStartResponse, 'El secreto y la dirección del QR.')
  @ApiDomainErrors('MFA_CHALLENGE_INVALID')
  @Post('mfa/setup')
  @HttpCode(HttpStatus.OK)
  async setupStart(@Req() req: Request) {
    const started = await this.startMfaSetup.execute(readCookie(req, MFA_COOKIE));
    return new ResponseDto(HttpStatus.OK, t('auth.mfa_setup_started'), {
      secret: started.secret,
      otpauth_uri: started.otpauthUri,
      issuer: started.issuer,
      account: started.account,
    });
  }

  @Public()
  @ApiOperation({ summary: 'Confirmar el segundo factor, recibir los códigos de recuperación y entrar', description: 'Con el primer código de 6 dígitos de la app activa el segundo factor, entrega **una sola vez** los 10 códigos de recuperación y abre la sesión. Un código equivocado cuenta como un intento fallido.' })
  @ApiData(AuthSessionWithRecoveryResponse, 'Segundo factor activo y sesión abierta. `recovery_codes` trae los 10 códigos.')
  @ApiDomainErrors('MFA_CHALLENGE_INVALID', 'MFA_SETUP_NOT_STARTED', 'MFA_CODE_INVALID', 'ACCOUNT_LOCKED', 'ACCOUNT_INACTIVE')
  @Post('mfa/setup/confirm')
  @HttpCode(HttpStatus.OK)
  async setupConfirm(@Body() dto: MfaCodeDto, @Req() req: Request, @Res({ passthrough: true }) res: Response) {
    const result = await this.confirmMfaSetup.execute({ challengeToken: readCookie(req, MFA_COOKIE), code: dto.code }, requestMeta(req));
    clearMfaChallengeCookie(res);
    setAuthCookies(res, result, this.policy.accessTokenTtl, result.session.expiresAt);
    const onboarding = await this.getOnboardingProgress.execute(result.user);
    return new ResponseDto(HttpStatus.OK, t('auth.mfa_enabled'), { ...toAuthResponse(result.user, onboarding), recovery_codes: result.recoveryCodes });
  }

  @ApiOperation({ summary: 'Generar códigos de recuperación nuevos', description: 'Seguridad de la cuenta: con la sesión abierta y un código vigente de la app, cambia los 10 códigos de recuperación por otros nuevos (los anteriores dejan de servir). Se muestran una sola vez. Un código equivocado cuenta como un intento fallido.' })
  @ApiData(RecoveryCodesResponse, 'Los 10 códigos nuevos.')
  @ApiDomainErrors('MFA_NOT_ENABLED', 'MFA_CODE_INVALID', 'ACCOUNT_LOCKED')
  @Post('mfa/recovery-codes')
  @HttpCode(HttpStatus.OK)
  async recoveryCodes(@CurrentUser() principal: Principal, @Body() dto: MfaCodeDto, @Req() req: Request) {
    const codes = await this.regenerateCodes.execute(principal, dto.code, requestMeta(req));
    return new ResponseDto(HttpStatus.OK, t('auth.mfa_recovery_regenerated'), { recovery_codes: codes });
  }

  // ── Activación de una cuenta que crea el administrador (D95, D96) ────────────────────────────────────────────────────────────────
  @Public()
  @ApiOperation({ summary: 'Comprobar un código de activación (paso 1 de la activación)', description: 'Con el código que el administrador de la empresa entregó a la persona, muestra el correo con el que se creó su cuenta. **No gasta el código ni crea nada.** Los intentos fallidos se auditan y cuentan para el límite de 10 por dirección cada 15 minutos, compartido con las claves de acceso.' })
  @ApiData(ActivationLookupResponse, 'El código se puede usar. El correo se muestra bloqueado en la pantalla de activación.')
  @ApiDomainErrors('ACTIVATION_CODE_INVALID', 'ACTIVATION_CODE_ALREADY_USED', 'ACTIVATION_CODE_EXPIRED', 'ACTIVATION_CODE_RATE_LIMITED')
  @Post('activate/lookup')
  @HttpCode(HttpStatus.OK)
  async activationLookup(@Body() dto: LookupActivationCodeDto, @Req() req: Request) {
    const found = await this.lookupActivationCode.execute(dto.code, requestMeta(req));
    return new ResponseDto(HttpStatus.OK, t('auth.activation_found'), { email: found.email, expires_at: found.expiresAt.toISOString() });
  }

  @Public()
  @ApiOperation({ summary: 'Activar la cuenta con el código y poner la contraseña (paso 2)', description: 'Gasta el código de un solo uso, pone la contraseña de la persona y pasa su cuenta de `pending` a `active`, todo en una transacción. Solo sirve con el correo con el que se creó la cuenta. Con el segundo factor obligatorio (D94) no abre la sesión: responde `data.next_step: mfa_setup` y deja la cookie `mnk_mfa`, igual que el canje de la clave de acceso. La contraseña debe tener 12 o más caracteres con mayúscula, minúscula, número y símbolo.' })
  @ApiData(MfaStepResponse, 'Cuenta activada. Sigue la configuración del segundo factor (`POST /auth/mfa/setup`).', { status: 201 })
  @ApiDomainErrors('ACTIVATION_CODE_INVALID', 'ACTIVATION_CODE_ALREADY_USED', 'ACTIVATION_CODE_EXPIRED', 'ACTIVATION_CODE_EMAIL_MISMATCH', 'ACTIVATION_CODE_RATE_LIMITED')
  @Post('activate')
  @HttpCode(HttpStatus.CREATED)
  async activate(@Body() dto: ActivateAccountDto, @Req() req: Request, @Res({ passthrough: true }) res: Response) {
    const result = await this.activateAccount.execute({ code: dto.code, email: dto.email, password: dto.password }, requestMeta(req));
    if (result.kind === 'mfa') {
      setMfaChallengeCookie(res, result.challenge.token, result.challenge.expiresAt);
      return new ResponseDto(HttpStatus.CREATED, t('auth.mfa_setup_required'), mfaStep(result.challenge));
    }
    // Solo con MFA_REQUIRED=false (desarrollo y pruebas): la cuenta activada entra directo.
    setAuthCookies(res, result, this.policy.accessTokenTtl, result.session.expiresAt);
    return new ResponseDto(HttpStatus.CREATED, t('auth.account_activated'), toAuthResponse(result.user));
  }
  @Public()
  @ApiOperation({ summary: 'Renovar la sesión', description: 'Sin cuerpo: usa la cookie `mnk_refresh`. Rota el refresh token (el anterior deja de servir) y renueva las cookies. Pasadas las 8 h de sesión o 30 min sin actividad responde 401 y hay que iniciar sesión de nuevo.' })
  @ApiEmpty('Cookies renovadas. `data` es `null`.')
  @ApiDomainErrors('SESSION_EXPIRED', 'ACCOUNT_INACTIVE')
  @Post('refresh')
  @HttpCode(HttpStatus.OK)
  async renew(@Req() req: Request, @Res({ passthrough: true }) res: Response) {
    try {
      const result = await this.refresh.execute(readCookie(req, REFRESH_COOKIE));
      setAuthCookies(res, result, this.policy.accessTokenTtl, result.session.expiresAt);
      return new ResponseDto(HttpStatus.OK, t('auth.refreshed'), null);
    } catch (error) {
      // Sesión muerta: se limpian las cookies para que el navegador no reintente con ellas.
      clearAuthCookies(res);
      throw error;
    }
  }

  @Public()
  @ApiOperation({ summary: 'Cerrar la sesión', description: 'Sin cuerpo. Invalida la sesión y limpia las cookies. Es idempotente: sin sesión también responde 204.' })
  @ApiNoBody('Sesión cerrada. No hay cuerpo.')
  @Post('logout')
  @HttpCode(HttpStatus.NO_CONTENT)
  async signOut(@Req() req: Request, @Res({ passthrough: true }) res: Response): Promise<void> {
    await this.logout.execute(readCookie(req, REFRESH_COOKIE), requestMeta(req));
    clearAuthCookies(res);
  }

  @ApiOperation({ summary: 'Usuario en sesión', description: 'Lo primero que llama el frontend al arrancar: dice si hay sesión, quién es y dónde continuar el onboarding.' })
  @ApiData(AuthSessionResponse, 'Usuario, empresa y avance del onboarding (este último solo para `admin_empresa`).')
  @Get('me')
  async me(@CurrentUser() principal: Principal) {
    const user = await this.getCurrentUser.execute(principal);
    const onboarding = await this.getOnboardingProgress.execute(user);
    return new ResponseDto(HttpStatus.OK, t('auth.me'), toAuthResponse(user, onboarding));
  }
}
