import {
  Body,
  Controller,
  Get,
  HttpException,
  HttpStatus,
  Logger,
  Param,
  Post,
  Query,
  Res,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { StorageService } from './storage/storage.service';
import { Document, ECMDocument, Metadata } from './storage/storage.model';
import { Response } from 'express';
import { unzip, zip } from './technical/Utils';

@Controller()
export class AppController {
  constructor(private readonly storageService: StorageService) {}

  @Get('documents/:id/content')
  async getDocumentContentById(
    @Param('id') id,
    @Query() queryString,
    @Res() res: Response,
  ) {
    console.log(JSON.stringify(id));
    console.log(JSON.stringify(queryString));
    const ecmFile = await this.storageService.getDocumentContent(
      id,
      queryString,
    );
    const content = ecmFile.fileContent.compressed
      ? unzip(ecmFile.fileContent.content)
      : ecmFile.fileContent.content;
    res.set({
      'Content-Type': ecmFile.fileContent.mimeType,
      'Content-Disposition': `attachment; filename=${ecmFile.fileContent.originalName}`,
      'Content-Length': content.length,
    });
    this.storageService.getReadableStream(content).pipe(res);
    console.log('done');
  }

  @Get('documents/:id')
  async getDocumentById(
    @Param('id') id,
    @Query() queryString,
  ): Promise<Array<ECMDocument>> {
    console.log(JSON.stringify(id));
    console.log(JSON.stringify(queryString));
    return allAsView(
      await this.storageService.getDocumentsById(id, queryString),
    );
  }

  @Post('documents/:id')
  @UseInterceptors(FileInterceptor('file'))
  async uploadFile(@Param('id') id, @UploadedFile() file, @Body() metadata) {
    Logger.debug(`test env ${process.env.TEST}`);
    try {
      const doc: Document = {
        id,
        metadata,
        fileContent: {
          content: isCompress(metadata) ? zip(file.buffer) : file.buffer,
          mimeType: file.mimetype,
          originalName: file.originalname,
          compressed: isCompress(metadata),
        },
        createdAt: new Date().toISOString(),
      };
      return asView(await this.storageService.upload(doc));
    } catch (e) {
      throw new HttpException(
        {
          status: HttpStatus.CONFLICT,
          error: e.message,
        },
        HttpStatus.CONFLICT,
      );
    }
  }
}

function isCompress(metadata: Metadata): boolean {
  if (metadata['compressed'] && metadata['compressed'] === 'true') {
    return true;
  } else {
    return false;
  }
}

function asView(ecmDocument: ECMDocument) {
  if (!ecmDocument) {
    throw new HttpException({}, HttpStatus.NO_CONTENT);
  }
  if (ecmDocument.fileContent) {
    delete ecmDocument.fileContent.content;
  }
  delete ecmDocument.contentStorage;
  return ecmDocument;
}

function allAsView(ecmDocuments: Array<ECMDocument>) {
  if (ecmDocuments.length === 0) {
    throw new HttpException({}, HttpStatus.NO_CONTENT);
  }
  return ecmDocuments.map((x) => asView(x));
}
