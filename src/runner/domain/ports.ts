import { EngineInput, EngineRun, RunnerJob, TemporaryCredentials } from './runner.types';

// La API interna del backend (`/internal/runner`).
export abstract class RunnerApi {
  // null si no hay nada pendiente (204).
  abstract claim(): Promise<RunnerJob | null>;
  abstract submitResults(job: RunnerJob, run: EngineRun, regions: string[]): Promise<void>;
  abstract fail(job: RunnerJob, reason: string): Promise<void>;
}

// Quién obtiene las credenciales con las que se mira la cuenta del cliente. Lanza RunnerFailure si no puede (rol que no se asume, cuenta distinta…).
export abstract class CredentialBroker {
  abstract obtain(job: RunnerJob): Promise<TemporaryCredentials>;
}

// Quién ejecuta el motor. Hoy, un contenedor efímero; mañana, una tarea en la nube: el bucle no cambia.
// Lanza RunnerFailure si la corrida no se puede completar.
export abstract class ScanEngine {
  abstract run(input: EngineInput): Promise<EngineRun>;
  // Al arrancar: retira lo que dejó una corrida interrumpida (un contenedor huérfano seguiría llevando credenciales).
  abstract cleanupOrphans(): Promise<number>;
}

export abstract class RunnerLogger {
  // Nunca lleva credenciales: solo identificadores de ejecución y razones.
  abstract info(message: string): void;
  abstract error(message: string): void;
}
