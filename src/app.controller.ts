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
import { asView, ECMDocument, Metadata, Origin } from './storage/storage.model';
import { Response } from 'express';
import { unzip, zip } from './technical/Utils';
import { AppService } from './app.service';
import { IndexerService } from './indexer/indexer.service';

@Controller()
export class AppController {
  constructor(
    private readonly storageService: StorageService,
    private readonly appService: AppService,
    private readonly indexerService: IndexerService,
  ) {}

  @Get('documents/:id/content')
  async getDocumentContentById(
    @Param('id') id,
    @Query() queryString,
    @Res() res: Response,
  ) {
    try {
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
    } catch (e) {
      throw new HttpException(
        {
          status: HttpStatus.NOT_FOUND,
          error: e.message,
        },
        HttpStatus.NOT_FOUND,
      );
    }
  }

  @Get('documents/:id')
  async getDocumentById(@Param('id') id, @Query() queryString) {
    console.log(JSON.stringify(id));
    console.log(JSON.stringify(queryString));
    return allAsView(
      await this.storageService.getDocumentsById(id, queryString),
    );
  }

  @Post('documents/document')
  @UseInterceptors(FileInterceptor('file'))
  async uploadFile(@UploadedFile() file, @Body() metadata) {
    return this.genericUpload(file, metadata, Origin.API);
  }

  @Post('documents/laradocuments')
  @UseInterceptors(FileInterceptor('file'))
  async uploadLaraFile(@UploadedFile() file, @Body() metadata) {
    return this.genericUpload(file, metadata, Origin.LARA);
  }

  async genericUpload(file, metadata, origin) {
    try {
      const doc = new ECMDocument(`${file.originalname}${file.mimetype}`, {
        content: isCompress(metadata) ? zip(file.buffer) : file.buffer,
        mimeType: file.mimetype,
        originalName: file.originalname,
        compressed: isCompress(metadata),
      });
      doc.addMetadata(metadata);
      doc.origin = origin;
      const preparedDoc = await this.appService.main(doc);
      if (!preparedDoc.validation.isValid) {
        throw new Error(
          `Document is not valid ${JSON.stringify(
            preparedDoc.validation.errors,
          )}`,
        );
      }
      const finalDoc = await this.storageService.upload(preparedDoc);
      await this.indexerService.indexDocument(doc);
      return finalDoc.asView(false);
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

function allAsView(ecmDocuments: Array<ECMDocument>) {
  if (ecmDocuments.length === 0) {
    throw new HttpException({}, HttpStatus.NO_CONTENT);
  }
  return ecmDocuments.map((x) => asView(x, false));
}
