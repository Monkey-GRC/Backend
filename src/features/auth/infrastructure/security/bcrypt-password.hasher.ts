import { Injectable } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { PasswordHasher } from '../../domain/ports/password-hasher';

const COST = 12;
// Hash fijo de una contraseña que nadie conoce: da a compareAgainstDummy el costo de un compare real.
const DUMMY_HASH = bcrypt.hashSync('monkey-dummy-password-never-valid', COST);

@Injectable()
export class BcryptPasswordHasher extends PasswordHasher {
  hash(plain: string): Promise<string> {
    return bcrypt.hash(plain, COST);
  }

  compare(plain: string, hash: string): Promise<boolean> {
    return bcrypt.compare(plain, hash);
  }

  async compareAgainstDummy(plain: string): Promise<void> {
    await bcrypt.compare(plain, DUMMY_HASH);
  }
}
