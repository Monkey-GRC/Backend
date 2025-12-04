import { Expose, Transform } from 'class-transformer';

export class ResponseDto {
    @Expose()
    message: string;

    @Expose()
    status: 0 | 1;

    @Expose({ toPlainOnly: true })
    @Transform(({ value }) => (value === null || value === undefined ? undefined : value), { toPlainOnly: true })
    data?: string | object;

    constructor(params: {
        message: string;
        status: 0 | 1;
        data?: string | object | null;
    }) {
        this.message = params.message;
        this.status = params.status;
        this.data = params.data ?? undefined;
    }
}