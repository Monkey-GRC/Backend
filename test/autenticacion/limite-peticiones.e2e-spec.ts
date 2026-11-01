import type { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { bootApp, login, PASSWORD } from '../support/app';
import { dosEmpresas, Tenant } from '../support/escenario';

// Límite de peticiones por sesión (SEG-19, §5.3): por usuario y por empresa, 429 RATE_LIMITED con Retry-After. Aquí los topes se bajan a 5 y 8 para no disparar cien peticiones;
// que por defecto sean 100 y 1000 lo prueba el spec unitario del guard.
let app: INestApplication;
let a: Tenant;
let b: Tenant;

beforeAll(async () => {
  app = await bootApp({ RATE_LIMIT_USER_PER_MINUTE: '5', RATE_LIMIT_COMPANY_PER_MINUTE: '8' });
  ({ a, b } = await dosEmpresas(app));
});
afterAll(async () => {
  await app?.close();
});

describe('límite de peticiones (SEG-19)', () => {
  it('pasado el tope de usuario: 429 RATE_LIMITED con Retry-After, y el aviso dice cuánto esperar', async () => {
    const agent = await login(app, a.email);
    const statuses: number[] = [];
    let last: request.Response | undefined;
    // dosEmpresas y login ya gastaron algunas peticiones de este usuario: se sigue hasta que llegue el 429.
    for (let i = 0; i < 8; i += 1) {
      last = await agent.get('/v1/auth/me');
      statuses.push(last.status);
    }
    expect(statuses).toContain(429);
    const blocked = (await agent.get('/v1/auth/me')) as request.Response;
    expect(blocked.status).toBe(429);
    expect(blocked.body.error.code).toBe('RATE_LIMITED');
    expect(blocked.body.error.retry_after_seconds).toBeGreaterThanOrEqual(1);
    expect(Number(blocked.headers['retry-after'])).toBe(blocked.body.error.retry_after_seconds);
    expect(blocked.body.message).toBeTruthy();
  });

  it('otra empresa no se entera: su usuario sigue entrando', async () => {
    const other = await login(app, b.email);
    expect((await other.get('/v1/auth/me')).status).toBe(200);
  });

  it('las rutas públicas no se cuentan: el ingreso responde aunque el usuario esté en el tope', async () => {
    for (let i = 0; i < 12; i += 1) {
      const res = await request(app.getHttpServer()).post('/v1/auth/login').send({ email: a.email, password: PASSWORD });
      expect(res.status).toBe(200);
    }
  });
});
