import { SetMetadata } from '@nestjs/common';

// Todo endpoint exige sesión por defecto; solo lo marcado con @Public() queda abierto.
export const IS_PUBLIC_KEY = 'isPublic';
export const Public = () => SetMetadata(IS_PUBLIC_KEY, true);
