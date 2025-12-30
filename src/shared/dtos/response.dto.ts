import { HttpStatus } from '@nestjs/common';
import { Expose, Transform } from 'class-transformer';

export class ResponseDto<T = any> {

    @Expose()
    message: string;

    @Expose()
    statusCode: HttpStatus;

    @Expose({ toPlainOnly: true })
    @Transform(
        ({ value }) => (value === undefined ? undefined : value),
        { toPlainOnly: true },
    )
    data?: T;

    constructor(params: {
        message: string;
        statusCode?: HttpStatus;
        data?: T;
    }) {
        this.message = params.message;
        this.statusCode = params.statusCode ?? HttpStatus.OK;
        this.data = params.data;
    }
}
