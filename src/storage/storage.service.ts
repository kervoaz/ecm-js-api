import * as DocumentRepository from './dao/document.dao';

import { Document, DocumentType, ECMDocument, Metadata } from './storage.model';
import { Injectable } from '@nestjs/common';
import { Readable } from 'stream';
import { AnalyzerService } from '../integrity/analyzer.service';
import { ValidationService } from 'src/integrity/validation.service';
import { MetadataRepository } from './dao/metadata.dao';

@Injectable()
export class StorageService {
  constructor(
    private readonly analyzerService: AnalyzerService,
    private readonly integrityService: ValidationService,
    private readonly metadataRepository: MetadataRepository  ) {}

  async upload(inFile: Document) {
    await this.integrityService.validate({productId:1,productName:'name'})
    await this.analyzerService.analyzePdf(inFile);
    inFile.type = getDocumentType(inFile);
    let ecmFile: ECMDocument = await DocumentRepository.save(inFile);
    ecmFile = await this.metadataRepository.save(ecmFile);
    return ecmFile;
  }

  async getDocumentsById(
    id: string,
    filters: Metadata,
  ): Promise<Array<ECMDocument>> {
    let ecmFile;
    if (filters['revision']) {
      ecmFile = [
        await this.metadataRepository.get(id, parseInt(filters['revision'])),
      ];
    } else {
      ecmFile = await this.metadataRepository.list(id);
    }
    return ecmFile;
  }

  async getDocumentContent(
    id: string,
    filters: Metadata,
  ): Promise<ECMDocument> {
    let ecmFile;
    if (filters['revision']) {
      ecmFile = await this.metadataRepository.get(id, parseInt(filters['revision']));
    } else {
      ecmFile = await this.metadataRepository.getLastRevision(id);
    }
    ecmFile = await DocumentRepository.get(ecmFile);
    return ecmFile;
  }

  getReadableStream(buffer: Buffer): Readable {
    const stream = new Readable();
    stream.push(buffer);
    stream.push(null);
    return stream;
  }
}

function getDocumentType(doc: Document): DocumentType {
  //TODO improve
  if (doc.type) {
    return doc.type;
  }
  if (doc.metadata['xBL']) {
    return { type: 'BL', allowRevision: true };
  } else {
    return { type: 'INVOICE', allowRevision: false };
  }
}
