import { xml2Json } from '../technical/Utils';
import { MetadataValue } from 'aws-sdk/clients/s3';

export class ECMiDocument {
  type?: DocumentType;
  revision?: number;
  metadata?: Metadata;
  createdAt: string;
  private _fileContent: FileContent;
  updatedAt?: string;
  storageInformation?: StorageInformation;
  documentAnalyzis: { parsed: string };
  constructor(readonly id: string, fileContent: FileContent) {
    this.createdAt = new Date().toISOString();
    this._fileContent = fileContent;
  }
  toString(): string {
    return JSON.stringify(this);
  }
  asJson() {
    this.documentAnalyzis.parsed = xml2Json(this.documentAnalyzis.parsed);
  }
  addMetadata(metaToAdd: Metadata) {
    this.metadata = { ...this.metadata, ...metaToAdd };
  }
  set fileContent(fileContent: FileContent) {
    this._fileContent = fileContent;
  }
  get fileContent():FileContent {
    return this._fileContent;
  }
}

// export interface Document {
//   id: string;
//   type?: DocumentType;
//   revision?: number;
//   metadata?: Metadata;
//   createdAt: string;
//   updatedAt?: string;
//   fileContent?: {
//     content: Buffer;
//     originalName: string;
//     mimeType: string;
//     compressed: boolean;
//   };
// }

export type Metadata = { [key: string]: MetadataValue };

export interface FileContent {
  content: Buffer;
  originalName: string;
  mimeType: string;
  compressed: boolean;
}

export interface StorageInformation {
  bucket: string;
  objectKey: string;
  versionId?: string;
}

export interface ECMDocument extends ECMiDocument {
  contentStorage: StorageInformation;
}

export interface DocumentType {
  type: string;
  allowRevision: boolean;
}

export interface BL extends DocumentType {
  type: 'BL';
  allowRevision: true;
}

export interface Invoice extends DocumentType {
  type: 'INVOICE';
  allowRevision: false;
}

export function allowRevision(document: ECMiDocument) {
  return document.type.allowRevision;
}
