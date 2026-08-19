import { Body, Controller, HttpStatus, Post, UseGuards, UsePipes, ValidationPipe } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ApiCookieAuth } from '@nestjs/swagger';
import { ResponseDto } from 'src/common/dtos/response.dto';
import { TranslateTextDto } from '../application/dtos/translate-text.dto';
import { TranslateTextUseCase } from '../application/use-cases/translate-text.use-case';

@ApiCookieAuth()
@UseGuards(AuthGuard('jwt'))
@UsePipes(new ValidationPipe({ transform: true, whitelist: true }))
@Controller('translation')
export class TranslationController {
    constructor(private readonly translateTextUseCase: TranslateTextUseCase) { }

    @Post()
    async translate(@Body() body: TranslateTextDto) {
        const translatedText = await this.translateTextUseCase.execute(body);
        return new ResponseDto({ statusCode: HttpStatus.OK, message: 'Texto traducido', data: { translatedText } });
    }
}
