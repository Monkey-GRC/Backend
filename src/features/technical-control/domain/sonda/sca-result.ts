import { CheckResultValue } from '../scan/scan.types';

// Los cinco estados del check (modelo-datos.md §3.3). La sonda los entrega como texto y, según la vía, `not applicable` llega como esas palabras
// (API de la versión 4.14.6, verificado) o como vacío (lo que documenta el cerebro): se aceptan las dos formas.
const MAP: Record<string, CheckResultValue> = {
  passed: 'passed',
  failed: 'failed',
  invalid: 'invalid',
  'not applicable': 'not_applicable',
  'not_applicable': 'not_applicable',
  '': 'not_applicable',
  'not run': 'not_run',
  'not_run': 'not_run',
};

/**
 * Un resultado que no reconocemos NO se toma por «pasó»: queda `invalid` (no se pudo interpretar). Inventarle un valor favorable a un check que no
 * entendemos sería certificar sin base (regla 3 del cerebro); `invalid` no cuenta como cumplido.
 */
export function scaResultToCheckResult(raw: string | null | undefined): CheckResultValue {
  return MAP[(raw ?? '').trim().toLowerCase().replace(/\s+/g, ' ')] ?? 'invalid';
}
