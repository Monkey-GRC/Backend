import { Controller, Get, HttpStatus, Query, UseGuards, UsePipes, ValidationPipe } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ApiCookieAuth } from '@nestjs/swagger';
import { ResponseDto } from 'src/common/dtos/response.dto';
import { GetChecklistQueryDto } from '../application/dtos/get-checklist-query.dto';
import { GetChecklistUseCase } from '../application/use-cases/get-checklist.use-case';

@ApiCookieAuth()
@UseGuards(AuthGuard('jwt'))
@UsePipes(new ValidationPipe({ transform: true, whitelist: true }))
@Controller('checklist')
export class ChecklistController {
    constructor(private readonly getChecklistUseCase: GetChecklistUseCase) { }

    @Get()
    async findByOs(@Query() query: GetChecklistQueryDto) {
        const data = await this.getChecklistUseCase.execute(query.os, query.search);
        return new ResponseDto({ statusCode: HttpStatus.OK, message: 'Checklist obtenido', data });
    }
}
