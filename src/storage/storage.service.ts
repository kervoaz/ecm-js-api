import * as DocumentRepository from './dao/document.dao';
import * as MetadataRepository from './dao/metadata.dao';
import { ECMDocument, Document, Metadata, DocumentType } from './storage.model';
import { Injectable } from '@nestjs/common';

@Injectable()
export class StorageService {
  async upload(inFile: Document) {

    const ecmFile: ECMDocument = await DocumentRepository.save(inFile);
    await MetadataRepository.save(ecmFile);
  }

  async getDocumentById(id: string, revision?: string) {
    let ecmFile = await MetadataRepository.getLastRevision(id);
    ecmFile = await DocumentRepository.get(ecmFile);
    return ecmFile;
  }
}
function typeFromMetadata(meta: Metadata): DocumentType{
  if(meta.keys())
}

export function generateUID(id: string) {
  return `${id}-${Date.now()}`;
}
