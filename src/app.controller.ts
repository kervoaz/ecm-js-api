import { Body, Controller, Get, Param, Post, Query, UploadedFile, UseInterceptors } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { generateUID, StorageService } from './storage/storage.service';
import { Document, ECMDocument } from './storage/storage.model';

@Controller()
export class AppController {
  constructor(private readonly storageService: StorageService) {
  }

  @Get('documents/:id')
  async getDocumentById(@Param('id') id, @Query() queryString): Promise<ECMDocument> {
    console.log(JSON.stringify(id));
    console.log(JSON.stringify(queryString));
    return await this.storageService.getDocumentById(id);
  }

  @Post('upload')
  @UseInterceptors(FileInterceptor('file'))
  async uploadFile(@UploadedFile() file, @Body() metadata) {
    const doc: Document = {
      id: generateUID('zou'),
      metadata,
      fileContent: {
        content: file.buffer,
        mimeType: file.mimetype,
        originalName: file.originalname,
      },
      createdAt: new Date().toISOString(),
    };
    return await this.storageService.upload(doc);
  }
}
