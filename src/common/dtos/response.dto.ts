// Sobre único de toda respuesta (contracts/conventions.md): éxito y error comparten forma.
export class ResponseDto<T> {
  constructor(
    public readonly statusCode: number,
    public readonly message: string,
    public readonly data: T | null,
  ) {}
}
