import { Body, Controller, Get, HttpCode, HttpStatus, Inject, Patch, Post, Req, Res } from '@nestjs/common';
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
import { ChangePasswordDto, ForgotPasswordDto, ResetPasswordDto } from '../application/dtos/password.dto';
import { LookupAccessKeyDto } from '../application/dtos/lookup-access-key.dto';
import { RedeemAccessKeyDto } from '../application/dtos/redeem-access-key.dto';
import { SESSION_POLICY } from '../application/session-policy.token';
import { ActivateAccountUseCase } from '../application/use-cases/activation/activate-account.use-case';
import { SetLanguageUseCase } from '../application/use-cases/session/set-language.use-case';
import { SetLanguageDto } from '../application/dtos/language.dto';
import { GetCurrentUserUseCase } from '../application/use-cases/session/get-current-user.use-case';
import { GetOnboardingProgressUseCase } from '../application/use-cases/session/get-onboarding-progress.use-case';
import { ConfirmMfaSetupUseCase } from '../application/use-cases/mfa/confirm-mfa-setup.use-case';
import { ChangePasswordUseCase } from '../application/use-cases/password/change-password.use-case';
import { ForgotPasswordUseCase } from '../application/use-cases/password/forgot-password.use-case';
import { ResetPasswordUseCase } from '../application/use-cases/password/reset-password.use-case';
import { LoginUseCase } from '../application/use-cases/session/login.use-case';
import { LogoutUseCase } from '../application/use-cases/session/logout.use-case';
import { LookupActivationCodeUseCase } from '../application/use-cases/activation/lookup-activation-code.use-case';
import { LookupAccessKeyUseCase } from '../application/use-cases/access-key/lookup-access-key.use-case';
import { RedeemAccessKeyUseCase } from '../application/use-cases/access-key/redeem-access-key.use-case';
import { RefreshSessionUseCase, UnknownRefreshTokenError } from '../application/use-cases/session/refresh-session.use-case';
import { RegenerateRecoveryCodesUseCase } from '../application/use-cases/mfa/regenerate-recovery-codes.use-case';
import { StartMfaSetupUseCase } from '../application/use-cases/mfa/start-mfa-setup.use-case';
import { VerifyMfaUseCase } from '../application/use-cases/mfa/verify-mfa.use-case';
import {
  clearAuthCookies,
  clearDeviceCookie,
  clearMfaChallengeCookie,
  isAdminClient,
  readDeviceCookie,
  readMfaCookie,
  readRefreshCookie,
  requestMeta,
  setAuthCookies,
  setDeviceCookie,
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
    private readonly changePassword: ChangePasswordUseCase,
    private readonly forgotPassword: ForgotPasswordUseCase,
    private readonly resetPassword: ResetPasswordUseCase,
    @Inject(SESSION_POLICY) private readonly policy: SessionPolicy,
    private readonly setLanguage: SetLanguageUseCase,
  ) {}

  @Public()
  @ApiOperation({ summary: 'Iniciar sesión', description: 'Valida el correo y la contraseña y abre la sesión: el servidor deja las cookies `httpOnly` `mnk_access` (15 min) y `mnk_refresh` en la respuesta (Monkey Admin, con el header `X-Monkey-Client: admin`, usa el prefijo `mnka_`). Nunca revela cuál de los dos datos falló. Con un dispositivo recordado vigente de esa misma persona (cookie `mnk_device`, D123) abre la sesión directo, sin segundo factor; cualquier otra cookie se ignora. **Con el segundo factor (D94) la contraseña correcta no abre la sesión:** responde `data.next_step` (`mfa_verify` o `mfa_setup`) y deja la cookie `mnk_mfa` (el desafío, 5 minutos); la sesión se abre en `POST /auth/mfa/verify` o `POST /auth/mfa/setup/confirm`. La sesión cierra a los 30 min sin actividad y a las 8 h de abierta; a los 5 intentos fallidos la cuenta se bloquea 15 min.' })
  @ApiData(AuthSessionResponse, 'Sesión abierta. Trae el usuario, su empresa y, para `admin_empresa`, el avance del onboarding.')
  @ApiDomainErrors('INVALID_CREDENTIALS', 'ACCOUNT_LOCKED', 'ACCOUNT_INACTIVE')
  @Post('login')
  @HttpCode(HttpStatus.OK)
  async signIn(
    @Body() dto: LoginDto,
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
  ) {
    const result = await this.login.execute(dto.email, dto.password, requestMeta(req), readDeviceCookie(req));
    if (result.kind === 'mfa') {
      setMfaChallengeCookie(req, res, result.challenge.token, result.challenge.expiresAt);
      return new ResponseDto(HttpStatus.OK, t(result.challenge.purpose === 'verify' ? 'auth.mfa_required' : 'auth.mfa_setup_required'), mfaStep(result.challenge));
    }
    setAuthCookies(req, res, result, this.policy.accessTokenTtl, result.session.expiresAt);
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
      setMfaChallengeCookie(req, res, result.challenge.token, result.challenge.expiresAt);
      return new ResponseDto(HttpStatus.CREATED, t('auth.mfa_setup_required'), mfaStep(result.challenge));
    }
    setAuthCookies(req, res, result, this.policy.accessTokenTtl, result.session.expiresAt);
    const onboarding = await this.getOnboardingProgress.execute(result.user);
    return new ResponseDto(HttpStatus.CREATED, t('auth.account_created'), toAuthResponse(result.user, onboarding));
  }

  // ── Segundo factor (D94) ───────────────────────────────────────────────────────────────────────────────────────────────────────────
  @Public()
  @ApiOperation({ summary: 'Verificar el segundo factor y abrir la sesión', description: 'Segundo paso del ingreso de quien ya tiene el segundo factor. Con la cookie `mnk_mfa` (la deja el login) y el código de 6 dígitos de su app —o uno de sus códigos de recuperación— abre la sesión con las mismas cookies del login. Un código equivocado cuenta como un intento fallido más: suma al bloqueo de la cuenta (5 intentos, 15 min) y al del desafío (5 intentos). Un código ya usado no sirve otra vez. Con `remember_device: true` (D123), correcto el código, deja además la cookie `mnk_device` (30 días) y el próximo ingreso desde este navegador salta el código; `admin_monkey` recibe 422 antes de comprobar el código.' })
  @ApiData(AuthSessionWithRecoveryResponse, 'Sesión abierta. Si entró con un código de recuperación, trae `recovery_codes_left`.')
  @ApiDomainErrors('MFA_CHALLENGE_INVALID', 'MFA_CODE_INVALID', 'ACCOUNT_LOCKED', 'ACCOUNT_INACTIVE', 'REMEMBER_DEVICE_NOT_ALLOWED')
  @Post('mfa/verify')
  @HttpCode(HttpStatus.OK)
  async verify(@Body() dto: VerifyMfaDto, @Req() req: Request, @Res({ passthrough: true }) res: Response) {
    const result = await this.verifyMfa.execute({ challengeToken: readMfaCookie(req), code: dto.code, recoveryCode: dto.recovery_code, rememberDevice: dto.remember_device && !isAdminClient(req) }, requestMeta(req));
    clearMfaChallengeCookie(req, res);
    setAuthCookies(req, res, result, this.policy.accessTokenTtl, result.session.expiresAt);
    if (result.deviceToken) setDeviceCookie(req, res, result.deviceToken);
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
    const started = await this.startMfaSetup.execute(readMfaCookie(req));
    return new ResponseDto(HttpStatus.OK, t('auth.mfa_setup_started'), {
      secret: started.secret,
      otpauth_uri: started.otpauthUri,
      issuer: started.issuer,
      account: started.account,
    });
  }

  @Public()
  @ApiOperation({ summary: 'Confirmar el segundo factor, recibir los códigos de recuperación y entrar', description: 'Con el primer código de 6 dígitos de la app activa el segundo factor, entrega **una sola vez** los 10 códigos de recuperación y abre la sesión. Un código equivocado cuenta como un intento fallido. `remember_device: true` (D123) funciona como en `POST /auth/mfa/verify`.' })
  @ApiData(AuthSessionWithRecoveryResponse, 'Segundo factor activo y sesión abierta. `recovery_codes` trae los 10 códigos.')
  @ApiDomainErrors('MFA_CHALLENGE_INVALID', 'MFA_SETUP_NOT_STARTED', 'MFA_CODE_INVALID', 'ACCOUNT_LOCKED', 'ACCOUNT_INACTIVE', 'REMEMBER_DEVICE_NOT_ALLOWED')
  @Post('mfa/setup/confirm')
  @HttpCode(HttpStatus.OK)
  async setupConfirm(@Body() dto: MfaCodeDto, @Req() req: Request, @Res({ passthrough: true }) res: Response) {
    const result = await this.confirmMfaSetup.execute({ challengeToken: readMfaCookie(req), code: dto.code, rememberDevice: dto.remember_device && !isAdminClient(req) }, requestMeta(req));
    clearMfaChallengeCookie(req, res);
    setAuthCookies(req, res, result, this.policy.accessTokenTtl, result.session.expiresAt);
    if (result.deviceToken) setDeviceCookie(req, res, result.deviceToken);
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

  // ── Contraseña: cambio y recuperación (D101, SEG-14) ───────────────────────────────────────────────────────────────────────────────
  @ApiOperation({ summary: 'Cambiar la contraseña', description: 'La persona cambia su contraseña cuando quiera. Con la sesión abierta pide la contraseña actual y un código vigente del segundo factor (`code`) o uno de recuperación (`recovery_code`). La nueva cumple la política (12+ caracteres con mayúscula, minúscula, número y símbolo), es distinta de la actual y de las 5 anteriores, y se permiten hasta 3 cambios en 24 h. Cierra las demás sesiones (esta sigue) y avisa por correo. La contraseña actual equivocada y un código equivocado suman al bloqueo de la cuenta (5 intentos, 15 min).' })
  @ApiNoBody('Contraseña cambiada. No hay cuerpo.')
  @ApiDomainErrors('CURRENT_PASSWORD_INVALID', 'MFA_CODE_INVALID', 'MFA_NOT_ENABLED', 'ACCOUNT_LOCKED', 'PASSWORD_REUSED', 'PASSWORD_CHANGE_LIMIT')
  @Post('password/change')
  @HttpCode(HttpStatus.NO_CONTENT)
  async changeOwnPassword(@CurrentUser() principal: Principal, @Body() dto: ChangePasswordDto, @Req() req: Request): Promise<void> {
    await this.changePassword.execute(
      principal,
      { currentPassword: dto.current_password, newPassword: dto.new_password, code: dto.code, recoveryCode: dto.recovery_code },
      requestMeta(req),
    );
  }

  @Public()
  @ApiOperation({ summary: 'Pedir el enlace para recuperar la contraseña', description: 'Responde **siempre lo mismo** (`202`), exista o no la cuenta: no revela qué correos están registrados. Si la cuenta existe y está activa, le llega un enlace de un solo uso que vence a los 30 minutos; uno nuevo deja sin efecto los anteriores. Hasta 5 enlaces por cuenta cada hora.' })
  @ApiEmpty('Si la cuenta existe, el enlace va en camino. `data` es `null`.', { status: 202 })
  @Post('password/forgot')
  @HttpCode(HttpStatus.ACCEPTED)
  async forgot(@Body() dto: ForgotPasswordDto, @Req() req: Request) {
    await this.forgotPassword.execute(dto.email, requestMeta(req));
    return new ResponseDto(HttpStatus.ACCEPTED, t('auth.password_forgot_requested'), null);
  }

  @Public()
  @ApiOperation({ summary: 'Crear la contraseña nueva con el enlace del correo', description: 'Con el `token` del enlace, la contraseña nueva y —quien ya tiene el segundo factor— un código vigente (`code`) o de recuperación (`recovery_code`). Cierra **todas** las sesiones de la persona y avisa por correo; después inicia sesión con la nueva. Un enlace que no existe, venció o ya se usó responde igual.' })
  @ApiNoBody('Contraseña cambiada. No hay cuerpo.')
  @ApiDomainErrors('PASSWORD_RESET_INVALID', 'MFA_CODE_INVALID', 'ACCOUNT_LOCKED', 'PASSWORD_REUSED')
  @Post('password/reset')
  @HttpCode(HttpStatus.NO_CONTENT)
  async reset(@Body() dto: ResetPasswordDto, @Req() req: Request): Promise<void> {
    await this.resetPassword.execute({ token: dto.token, newPassword: dto.new_password, code: dto.code, recoveryCode: dto.recovery_code }, requestMeta(req));
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
      setMfaChallengeCookie(req, res, result.challenge.token, result.challenge.expiresAt);
      return new ResponseDto(HttpStatus.CREATED, t('auth.mfa_setup_required'), mfaStep(result.challenge));
    }
    // Solo con MFA_REQUIRED=false (desarrollo y pruebas): la cuenta activada entra directo.
    setAuthCookies(req, res, result, this.policy.accessTokenTtl, result.session.expiresAt);
    return new ResponseDto(HttpStatus.CREATED, t('auth.account_activated'), toAuthResponse(result.user));
  }
  @Public()
  @ApiOperation({ summary: 'Renovar la sesión', description: 'Sin cuerpo: usa la cookie `mnk_refresh` (`mnka_refresh` para Admin, según `X-Monkey-Client`). Rota el refresh token (el anterior deja de servir) y renueva las cookies. Pasadas las 8 h de sesión o 30 min sin actividad responde 401 y hay que iniciar sesión de nuevo.' })
  @ApiEmpty('Cookies renovadas. `data` es `null`.')
  @ApiDomainErrors('SESSION_EXPIRED', 'ACCOUNT_INACTIVE')
  @Post('refresh')
  @HttpCode(HttpStatus.OK)
  async renew(@Req() req: Request, @Res({ passthrough: true }) res: Response) {
    try {
      const result = await this.refresh.execute(readRefreshCookie(req));
      setAuthCookies(req, res, result, this.policy.accessTokenTtl, result.session.expiresAt);
      return new ResponseDto(HttpStatus.OK, t('auth.refreshed'), null);
    } catch (error) {
      // Sesión muerta: se limpian las cookies para que el navegador no reintente con ellas. Si el token no corresponde a ninguna sesión
      // (rotado por otra pestaña a la vez) no se tocan: borrarían las cookies recién renovadas y la persona caería al login.
      if (!(error instanceof UnknownRefreshTokenError)) clearAuthCookies(req, res);
      throw error;
    }
  }

  @Public()
  @ApiOperation({ summary: 'Cerrar la sesión', description: 'Sin cuerpo. Invalida la sesión y limpia las cookies (`mnk_` o, para Admin, `mnka_`). También olvida el dispositivo recordado de este navegador (D123) y borra `mnk_device`, salvo que la cookie sea el dispositivo vigente de otra persona o el cliente sea Admin (`X-Monkey-Client: admin`), que no toca `mnk_device`. Es idempotente: sin sesión también responde 204.' })
  @ApiNoBody('Sesión cerrada. No hay cuerpo.')
  @Post('logout')
  @HttpCode(HttpStatus.NO_CONTENT)
  async signOut(@Req() req: Request, @Res({ passthrough: true }) res: Response): Promise<void> {
    const { clearDeviceCookie: forgetCookie } = await this.logout.execute(readRefreshCookie(req), readDeviceCookie(req), requestMeta(req));
    clearAuthCookies(req, res);
    if (forgetCookie) clearDeviceCookie(req, res);
  }

  @ApiOperation({ summary: 'Usuario en sesión', description: 'Lo primero que llama el frontend al arrancar: dice si hay sesión, quién es y dónde continuar el onboarding.' })
  @ApiData(AuthSessionResponse, 'Usuario, empresa y avance del onboarding (este último solo para `admin_empresa`).')
  @Get('me')
  async me(@CurrentUser() principal: Principal) {
    const { user, onboarding } = await this.getCurrentUser.execute(principal);
    return new ResponseDto(HttpStatus.OK, t('auth.me'), toAuthResponse(user, onboarding));
  }

  // D111 · Con sesión, cualquier rol. Lo llama el frontend al cambiar de idioma y al iniciar sesión si el de la app no coincide con `user.preferred_language`.
  @ApiOperation({ summary: 'Guardar mi idioma', description: 'Guarda el idioma en el que la persona usa Monkey (`es` o `en`); con él salen sus correos (recuperar la contraseña y el aviso de contraseña cambiada). Cualquier rol con sesión. Deja rastro (`user.language_changed`) en la misma transacción. Contrato: `contracts/autenticacion.md`.' })
  @ApiNoBody('Idioma guardado. No hay cuerpo.')
  @Patch('me/language')
  @HttpCode(HttpStatus.NO_CONTENT)
  async changeLanguage(@CurrentUser() principal: Principal, @Body() dto: SetLanguageDto, @Req() req: Request): Promise<void> {
    await this.setLanguage.execute(principal, dto.language, requestMeta(req));
  }
}
