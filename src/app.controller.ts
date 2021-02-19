import {
  Body,
  Controller,
  Get,
  Post,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { AppService } from './app.service';
import { upload } from './storage/storage.service';
import { DocType, ECMFile } from './storage/storage.model';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  getHello(): string {
    return this.appService.getHello();
  }
  @Post('upload')
  @UseInterceptors(FileInterceptor('file'))
  uploadFile(@UploadedFile() file, @Body() metadata) {
    const ecmFile: ECMFile = {
      id: 'zou' + Date.now(),
      docType: DocType.INVOICE,
      fileContent: file,
      metadata,
      fileLink: { bucket: 'create-by-api', objectKey: 'file.pdf' },
      revision: 1,
      createdAt: new Date().toISOString(),
    };
    upload(ecmFile);
  }
}
