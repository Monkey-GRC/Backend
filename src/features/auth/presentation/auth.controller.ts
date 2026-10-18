import { Body, Controller, Get, HttpCode, HttpStatus, Inject, Post, Req, Res } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import type { Request, Response } from 'express';
import { I18nContext } from 'nestjs-i18n';
import type { Principal } from '../../../common/auth/principal';
import { CurrentUser } from '../../../common/decorators/current-user.decorator';
import { Public } from '../../../common/decorators/public.decorator';
import { ResponseDto } from '../../../common/dtos/response.dto';
import type { SessionPolicy } from '../domain/entities/session.entity';
import { LoginDto } from '../application/dtos/login.dto';
import { LookupAccessKeyDto } from '../application/dtos/lookup-access-key.dto';
import { RedeemAccessKeyDto } from '../application/dtos/redeem-access-key.dto';
import { SESSION_POLICY } from '../application/session-policy.token';
import { GetCurrentUserUseCase } from '../application/use-cases/get-current-user.use-case';
import { GetOnboardingProgressUseCase } from '../application/use-cases/get-onboarding-progress.use-case';
import { LoginUseCase } from '../application/use-cases/login.use-case';
import { LogoutUseCase } from '../application/use-cases/logout.use-case';
import { LookupAccessKeyUseCase } from '../application/use-cases/lookup-access-key.use-case';
import { RedeemAccessKeyUseCase } from '../application/use-cases/redeem-access-key.use-case';
import { RefreshSessionUseCase } from '../application/use-cases/refresh-session.use-case';
import {
  clearAuthCookies,
  readCookie,
  REFRESH_COOKIE,
  requestMeta,
  setAuthCookies,
} from './auth-cookies';
import { toAuthResponse } from './auth-response.mapper';
import { API_TAGS } from '../../../common/swagger/api-docs.config';
import { ApiData, ApiDomainErrors, ApiEmpty, ApiNoBody } from '../../../common/swagger/api-envelope';
import { AccessKeyLookupResponse, AuthSessionResponse } from './auth.responses';

const t = (key: string): string =>
  (I18nContext.current()?.t(key) as string | undefined) ?? key;

@ApiTags(API_TAGS.auth)
@Controller('auth')
export class AuthController {
  constructor(
    private readonly login: LoginUseCase,
    private readonly refresh: RefreshSessionUseCase,
    private readonly logout: LogoutUseCase,
    private readonly getCurrentUser: GetCurrentUserUseCase,
    private readonly redeemAccessKey: RedeemAccessKeyUseCase,
    private readonly lookupAccessKey: LookupAccessKeyUseCase,
    private readonly getOnboardingProgress: GetOnboardingProgressUseCase,
    @Inject(SESSION_POLICY) private readonly policy: SessionPolicy,
  ) {}

  @Public()
  @ApiOperation({ summary: 'Iniciar sesión', description: 'Valida el correo y la contraseña y abre la sesión: el servidor deja las cookies `httpOnly` `mnk_access` (15 min) y `mnk_refresh` en la respuesta. Nunca revela cuál de los dos datos falló. La sesión cierra a los 30 min sin actividad y a las 8 h de abierta; a los 5 intentos fallidos la cuenta se bloquea 15 min.' })
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
    setAuthCookies(res, result, this.policy.accessTokenTtl, result.session.expiresAt);
    const onboarding = await this.getOnboardingProgress.execute(result.user);
    return new ResponseDto(HttpStatus.CREATED, t('auth.account_created'), toAuthResponse(result.user, onboarding));
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
