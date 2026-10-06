import { Body, Controller, Get, HttpCode, HttpStatus, Inject, Post, Req, Res } from '@nestjs/common';
import { ApiCookieAuth, ApiTags } from '@nestjs/swagger';
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

const t = (key: string): string =>
  (I18nContext.current()?.t(key) as string | undefined) ?? key;

@ApiTags('auth')
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
  @Post('logout')
  @HttpCode(HttpStatus.NO_CONTENT)
  async signOut(@Req() req: Request, @Res({ passthrough: true }) res: Response): Promise<void> {
    await this.logout.execute(readCookie(req, REFRESH_COOKIE), requestMeta(req));
    clearAuthCookies(res);
  }

  @ApiCookieAuth()
  @Get('me')
  async me(@CurrentUser() principal: Principal) {
    const user = await this.getCurrentUser.execute(principal);
    const onboarding = await this.getOnboardingProgress.execute(user);
    return new ResponseDto(HttpStatus.OK, t('auth.me'), toAuthResponse(user, onboarding));
  }
}
