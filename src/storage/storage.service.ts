import { ECMiDocument, Metadata } from './storage.model';
import { Injectable } from '@nestjs/common';
import { Readable } from 'stream';
import { MimeRouterService } from '../integrity/mime-router.service';
import { MetadataRepository } from './dao/metadata.dao';
import { ValidationService } from '../integrity/validation.service';
import { DocumentRepository } from './dao/document.dao';

@Injectable()
export class StorageService {
  constructor(
    private readonly analyzerService: MimeRouterService,
    private readonly integrityService: ValidationService,
    private readonly metadataRepository: MetadataRepository,
    private readonly documentRepository: DocumentRepository,
  ) {}

  async upload(inFile: ECMiDocument) {
    let ecmFile: ECMiDocument = await this.documentRepository.save(inFile);
    ecmFile = await this.metadataRepository.save(ecmFile);
    return ecmFile;
  }

  async getDocumentsById(
    id: string,
    filters: Metadata,
  ): Promise<Array<ECMiDocument>> {
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
  ): Promise<ECMiDocument> {
    let ecmFile;
    if (filters['revision']) {
      ecmFile = await this.metadataRepository.get(
        id,
        parseInt(filters['revision']),
      );
      if (!ecmFile) {
        throw new Error(
          `File ${id} doesn't exist in the specified revision ${filters['revision']}`,
        );
      }
    } else {
      ecmFile = await this.metadataRepository.getLastRevision(id);
      if (!ecmFile) {
        throw new Error(`The file ${id} doesn't exist`);
      }
    }
    ecmFile = await this.documentRepository.get(ecmFile);
    return ecmFile;
  }

  getReadableStream(buffer: Buffer): Readable {
    const stream = new Readable();
    stream.push(buffer);
    stream.push(null);
    return stream;
  }
}
