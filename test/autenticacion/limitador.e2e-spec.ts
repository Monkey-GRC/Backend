import type { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { bootApp } from '../support/app';

// SEG-19 (parcial): el freno de intentos de la clave de acceso. Vive en su propio archivo porque el contador es de la
// instancia de la app y queda lleno al terminar: cada archivo levanta su app y tiene su propio contador.
let app: INestApplication;
beforeAll(async () => {
  app = await bootApp();
});
afterAll(async () => {
  await app?.close();
});

describe('SEG-19 · 10 intentos fallidos cada 15 min por dirección, en redeem y en lookup', () => {
  it('con 10 claves inválidas, el intento 11 recibe 429 en los dos endpoints', async () => {
    const http = () => request(app.getHttpServer());
    for (let i = 0; i < 10; i++) {
      const res = await http().post('/v1/auth/redeem/lookup').send({ code: `MNK-AAAA-BBBB-${String(1000 + i)}` });
      expect(res.status).toBe(404);
      expect(res.body.error.code).toBe('ACCESS_KEY_INVALID');
    }
    const blocked = await http().post('/v1/auth/redeem/lookup').send({ code: 'MNK-AAAA-BBBB-9999' });
    expect(blocked.status).toBe(429);
    expect(blocked.body.error.code).toBe('ACCESS_KEY_RATE_LIMITED');
    const redeem = await http().post('/v1/auth/redeem').send({ code: 'MNK-AAAA-BBBB-9999', email: 'x@aislamiento.test', password: 'UnaClaveLarga123!' });
    expect(redeem.status).toBe(429);
    expect(redeem.body.error.code).toBe('ACCESS_KEY_RATE_LIMITED');
  });
});
