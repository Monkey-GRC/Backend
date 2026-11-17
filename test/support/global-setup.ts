import { Client } from 'pg';
import { testDatabaseUrl } from './db';

// Clona la base plantilla (la de TEST_DATABASE_URL) en una base por worker: `<plantilla>_w1 … _wN`. Cada corrida las
// recrea, así que parten limpias y los workers no se pisan entre sí (ver test/support/worker-db.ts).
export default async function globalSetup(globalConfig: { maxWorkers: number }): Promise<void> {
  const url = new URL(testDatabaseUrl());
  const template = url.pathname.slice(1);
  const admin = new URL(url.toString());
  admin.pathname = '/postgres';
  const db = new Client({ connectionString: admin.toString() });
  await db.connect();
  try {
    for (let n = 1; n <= Math.max(1, globalConfig.maxWorkers); n++) {
      const name = `${template}_w${n}`;
      await db.query(`drop database if exists "${name}" with (force)`);
      await db.query(`create database "${name}" template "${template}"`);
    }
  } finally {
    await db.end();
  }
}
