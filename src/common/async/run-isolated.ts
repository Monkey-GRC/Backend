// Corre pasos independientes uno tras otro; si uno lanza, avisa a `onError` (que registra) y los demás corren igual. Nunca propaga: lo que falte lo repite la siguiente pasada.
export async function runIsolated(steps: ReadonlyArray<readonly [label: string, run: () => Promise<void>]>, onError: (label: string, error: Error) => void): Promise<void> {
  for (const [label, run] of steps) {
    try {
      await run();
    } catch (error) {
      onError(label, error instanceof Error ? error : new Error(String(error)));
    }
  }
}
