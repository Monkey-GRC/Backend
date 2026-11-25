/** Las nueve dimensiones del enum `catalog.dimension` (catálogo v2, RC-05). Una sola lista para los DTO y las respuestas: el OpenAPI las nombra `Dimension`. */
export const DIMENSIONS = ['policy', 'server', 'database', 'app', 'cloud', 'network', 'endpoint', 'physical', 'process'] as const;
export type DimensionName = (typeof DIMENSIONS)[number];
export const isDimension = (value: unknown): value is DimensionName => typeof value === 'string' && (DIMENSIONS as readonly string[]).includes(value);
