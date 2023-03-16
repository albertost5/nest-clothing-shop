import {
  Controller,
  Get,
  NotFoundException,
  Param,
  Post,
  Res,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { FilesService } from './files.service';
import { fileFilter, fileNamer } from './helpers/index';
import { Response } from 'express';
import { ConfigService } from '@nestjs/config';
import { ApiTags } from '@nestjs/swagger/dist';

@ApiTags('Images')
@Controller('files')
export class FilesController {
  constructor(
    private readonly filesService: FilesService,
    private readonly configService: ConfigService,
  ) {}

  @Post('product')
  @UseInterceptors(
    FileInterceptor('file', {
      fileFilter: fileFilter,
      storage: diskStorage({
        destination: './static/products',
        filename: fileNamer,
      }),
    }),
  )
  uploadProductImage(
    @UploadedFile()
    file: Express.Multer.File,
  ) {
    if (!file) throw new NotFoundException('There is no file');

    const SECURE_URL = `${this.configService.get('BASE_PATH')}/files/product/${
      file.filename
    } `;

    return {
      secureUrl: SECURE_URL,
    };
  }

  @Get('product/:imageName')
  findProductImage(
    @Res()
    res: Response,
    @Param('imageName')
    imageName: string,
  ) {
    const path = this.filesService.findProductImage(imageName);

    return res.sendFile(path);
  }
}
