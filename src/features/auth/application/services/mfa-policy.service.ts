import { Injectable, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

// D94 · ¿Es obligatorio el segundo factor? Sí, para los 4 roles y sin excepciones (SEG-16). `MFA_REQUIRED=false` solo existe para trabajar en local sin tener que sacar
// el celular en cada ingreso (igual que `PROBE_MODE=simulated`): quien ya activó el segundo factor lo sigue pasando, y en producción el servidor se niega a arrancar así.
@Injectable()
export class MfaPolicy implements OnModuleInit {
  constructor(private readonly config: ConfigService) {}

  isRequired(): boolean {
    return this.config.get<string>('MFA_REQUIRED') !== 'false';
  }

  onModuleInit(): void {
    if (!this.isRequired() && this.config.get<string>('NODE_ENV') === 'production') {
      throw new Error('MFA_REQUIRED=false no se permite en producción: el segundo factor es obligatorio (SEG-16).');
    }
  }
}