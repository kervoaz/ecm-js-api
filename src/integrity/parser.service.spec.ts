import { ParserService } from './parser.service';

import * as fs from 'fs';
import { HttpModule, HttpService, Logger } from '@nestjs/common';
import * as path from 'path';
import next from 'ajv/dist/vocabularies/next';
import { AppController } from '../app.controller';
import { Test, TestingModule } from '@nestjs/testing';

describe('parse file', async () => {
  const filename = 'original_invoice_TWCI_32pages32bookmarks.pdf';
  const filepath = '../test/';
  const fullname = path.resolve(filepath, filename);
  const file_stream = fs.createReadStream(fullname);
  const parser = new ParserService(new HttpService());
  const res = await parser.parse(file_stream);
  Logger.debug('ici' + res.data);
});
