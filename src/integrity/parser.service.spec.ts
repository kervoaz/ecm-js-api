import { ContentAnalyzerService } from './content-analyzer.service';

import * as fs from 'fs';
import { HttpModule, HttpService, Logger } from '@nestjs/common';
import * as path from 'path';
import next from 'ajv/dist/vocabularies/next';
import { AppController } from '../app.controller';
import { Test, TestingModule } from '@nestjs/testing';
import { ECMiDocument } from '../storage/storage.model';

describe('parse file', async () => {
  const filename = 'original_invoice_TWCI_32pages32bookmarks.pdf';
  const filepath = '../test/';
  const fullname = path.resolve(filepath, filename);
  const file_stream = fs.createReadStream(fullname);
  const parser = new ContentAnalyzerService(new HttpService());
  const doc = new ECMiDocument('testId', {
    compressed: false,
    content: undefined,
    mimeType: '',
    originalName: '',
  });
  const res = await parser.extract(doc);
  Logger.debug('ici' + res.data);
});
