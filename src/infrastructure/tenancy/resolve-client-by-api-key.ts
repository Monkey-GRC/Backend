import { UnauthorizedException } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { CentralPrismaService } from 'src/infrastructure/database/central-prisma.service';
import { splitApiKey } from './api-key.util';

/**
 * Resuelve y valida un api_key contra la DB central. Usado por el login de
 * tenant (AuthService) y por el endpoint de onboarding que crea el primer
 * admin de un tenant (que todavía no tiene sesión).
 */
export async function resolveClientByApiKey(centralPrisma: CentralPrismaService, apiKey: string) {
  let apiKeyId: string;
  let secret: string;
  try {
    ({ apiKeyId, secret } = splitApiKey(apiKey));
  } catch {
    throw new UnauthorizedException('api_key inválido');
  }

  const client = await centralPrisma.client.findUnique({ where: { api_key_id: apiKeyId } });
  if (!client || !client.is_active) {
    throw new UnauthorizedException('api_key inválido');
  }

  const ok = await bcrypt.compare(secret, client.api_key_hash);
  if (!ok) {
    throw new UnauthorizedException('api_key inválido');
  }

  return client;
}
