import { EngineFinding } from '../scan/scan.types';

// Lee la salida cruda de un motor de nube y la normaliza. Lanza ENGINE_OUTPUT_INVALID si una fila está mal formada (indicando cuál).
// El dominio no conoce el formato; lo implementa la infraestructura.
export abstract class EngineOutputParser {
  abstract parse(raw: unknown): EngineFinding[];
}
