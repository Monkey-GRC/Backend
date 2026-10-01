export declare class ResponseDto<T> {
    readonly statusCode: number;
    readonly message: string;
    readonly data: T | null;
    constructor(statusCode: number, message: string, data: T | null);
}
