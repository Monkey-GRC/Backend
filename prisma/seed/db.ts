import 'dotenv/config';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from '../../generated/prisma/client';
import { CatalogV2, CATALOG_V2_JSON } from './catalog/types';

export function readCatalogJson(): CatalogV2 {
  return JSON.parse(readFileSync(resolve(CATALOG_V2_JSON), 'utf8')) as CatalogV2;
}

export function describeTarget(url: string) {
  const u = new URL(url);
  return {
    host: u.hostname,
    port: u.port || '5432',
    database: u.pathname.slice(1),
    user: decodeURIComponent(u.username),
  };
}

/**
 * Conecta con DATABASE_URL (el rol dueño, el mismo de las migraciones). El seed del catálogo es una
 * operación de deploy como `migrate deploy`: el RLS de `catalog` solo deja escribir a admin_monkey y
 * el rol dueño lo omite. La app en runtime nunca usa este rol.
 */
export async function connectAsOwner() {
  const url = process.env.DATABASE_URL;
  if (!url) throw new Error('Falta DATABASE_URL (rol dueño, el de las migraciones).');
  const prisma = new PrismaClient({ adapter: new PrismaPg({ connectionString: url }) });
  const rows = await prisma.$queryRaw<{ current_user: string; current_database: string }[]>`
    select current_user, current_database()`;
  return { prisma, target: describeTarget(url), currentUser: rows[0].current_user };
}

export const short = (v: unknown, n = 70): string => {
  const s = typeof v === 'string' ? v : JSON.stringify(v);
  return s.length > n ? s.slice(0, n) + '…' : s;
};
