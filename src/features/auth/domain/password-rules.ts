// D101 · Reglas del cambio y la recuperación de contraseña (contracts/modules/auth.md). La contraseña no vence por calendario: estas reglas solo evitan
// que se vuelva a una reciente, que se rote sin límite para volver a la original y que un enlace de recuperación viva más de lo necesario.
export const PASSWORD_HISTORY_SIZE = 5;
export const PASSWORD_CHANGES_PER_DAY = 3;
export const PASSWORD_RESET_TOKEN_MINUTES = 30;
export const PASSWORD_RESET_REQUESTS_PER_HOUR = 5;
