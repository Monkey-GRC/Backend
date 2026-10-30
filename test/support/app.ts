import { randomBytes } from 'node:crypto';
import type { INestApplication } from '@nestjs/common';
import { Test, TestingModuleBuilder } from '@nestjs/testing';
import bcrypt from 'bcrypt';
import request from 'supertest';
import { AppModule } from '../../src/app.module';
import { configureApp } from '../../src/app.setup';
import { Mailer } from '../../src/common/mail/mailer';
import { correo } from './correo-en-memoria';
import { connect, testDatabaseUrl } from './db';

export const PASSWORD = 'UnaClaveLarga123!';
export const MONKEY_PRINCIPAL_ARN = 'arn:aws:iam::210987654321:user/monkey-prueba';
export const RUNNER_TOKEN = 'token-de-prueba-del-trabajador-0123456789';

// La app de las pruebas e2e usa el rol REAL de runtime (monkey_app, sujeto a RLS) contra el Postgres desechable. Se
// niega a arrancar si APP_DATABASE_URL no es local, para no escribir en la base compartida de dev.
function appDatabaseUrl(): string {
  const owner = new URL(testDatabaseUrl());
  const url = new URL(owner.toString());
  url.username = 'monkey_app';
  url.password = process.env.TEST_APP_PASSWORD ?? 'test';
  return url.toString();
}

/** `env` sobrescribe lo de por defecto solo para esta app (p. ej. PROBE_MODE=runner). Cada llamada vuelve a fijar los valores base. */
/** `configure` deja sustituir proveedores solo para esta app (p. ej. el almacenamiento por uno en memoria). */
export async function bootApp(env: Record<string, string> = {}, configure?: (builder: TestingModuleBuilder) => TestingModuleBuilder): Promise<INestApplication> {
  Object.assign(process.env, {
    APP_DATABASE_URL: appDatabaseUrl(),
    JWT_SECRET: randomBytes(64).toString('base64url'),
    TOKEN_HASH_PEPPER: randomBytes(32).toString('base64url'),
    CREDENTIALS_ENCRYPTION_KEY: randomBytes(32).toString('base64'),
    JWT_ACCESS_EXPIRES_IN: '900',
    SESSION_IDLE_TIMEOUT: '1800',
    SESSION_MAX_DURATION: '28800',
    ACCESS_KEY_TTL_HOURS: '168',
    PROBE_MODE: 'simulated',
    // D94 · El segundo factor es obligatorio; las pruebas de siempre entran solo con contraseña. Las del segundo factor lo encienden (test/autenticacion/mfa.e2e-spec.ts).
    MFA_REQUIRED: 'false',
    RUNNER_TOKEN: RUNNER_TOKEN,
    READINESS_INCLUDE_PROPOSED: 'true',
    MONKEY_AWS_PRINCIPAL_ARN: MONKEY_PRINCIPAL_ARN,
    VALIDATION_WAIT_SECONDS: '25',
    NODE_ENV: 'test',
    // D97 · Sin tarea programada del borrado definitivo: las pruebas la ejecutan a mano.
    COMPANY_PURGE_INTERVAL_MINUTES: '0',
    ...env,
  });
  // Las variables se fijan antes de compilar el módulo: es cuando los servicios leen la configuración.
  // D99 · Nunca se envía correo de verdad: la clave de acceso se lee de `claveEnviadaA`.
  correo.falla = false;
  const builder = Test.createTestingModule({ imports: [AppModule] }).overrideProvider(Mailer).useValue(correo);
  const moduleRef = await (configure ? configure(builder) : builder).compile();
  const app = moduleRef.createNestApplication();
  // Los errores que las pruebas provocan a propósito (p. ej. un rastro que falla) no deben llenar la salida.
  app.useLogger(false);
  configureApp(app);
  await app.init();
  return app;
}

/** Sufijo único por corrida: las pruebas escriben por la API (no se revierten), así que los nombres no pueden chocar. */
export const RUN = randomBytes(3).toString('hex');

/** El primer admin_monkey, creado como dueño (en producción lo hace `npm run bootstrap:admin`). */
export async function seedAdminMonkey(): Promise<{ email: string }> {
  const db = await connect();
  try {
    const email = `admin-monkey-${RUN}@aislamiento.test`;
    const company = await db.query<{ id: string }>(
      `insert into platform.companies (id, name, admin_email, updated_at) values (gen_random_uuid(), $1, $2, now()) returning id`,
      [`Monkey interna ${RUN}`, email],
    );
    await db.query(
      `insert into platform.users (id, company_id, email, name, last_name, password_hash, role)
       values (gen_random_uuid(), $1, $2, 'Admin', 'Monkey', $3, 'admin_monkey')`,
      [company.rows[0].id, email, await bcrypt.hash(PASSWORD, 4)],
    );
    return { email };
  } finally {
    await db.end();
  }
}

export type Agent = ReturnType<typeof request.agent>;

export async function login(app: INestApplication, email: string): Promise<Agent> {
  const agent = request.agent(app.getHttpServer());
  const res = await agent.post('/v1/auth/login').send({ email, password: PASSWORD });
  if (res.status !== 200) throw new Error(`login ${email} → ${res.status} ${JSON.stringify(res.body)}`);
  return agent;
}

/** Una consulta como DUEÑO de la base (sin RLS): para comprobar o preparar estado que la API no deja tocar. */
export async function owner<T extends Record<string, unknown> = Record<string, unknown>>(sql: string, params: unknown[] = []): Promise<T[]> {
  const db = await connect();
  try {
    return (await db.query(sql, params)).rows as T[];
  } finally {
    await db.end();
  }
}
