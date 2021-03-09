import { xml2Json } from '../technical/Utils';
import { MetadataValue } from 'aws-sdk/clients/s3';
import { HttpException, HttpStatus } from '@nestjs/common';

export class ECMiDocument {
  type?: DocumentType;
  revision?: number;
  idDiscovered: string;
  metadata?: Metadata;
  createdAt: string;
  origin: Origin;
  private _fileContent: FileContent;
  updatedAt?: string;
  contentStorage: StorageInformation;
  documentAnalyzis: { parsed: string; error?: string };
  validation?: { isValid: boolean; errors?: any[] };
  constructor(readonly _id: string, fileContent: FileContent) {
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
    if (this.metadata) {
      this.idDiscovered = this.metadata['functionalKey'];
    }
  }
  set fileContent(fileContent: FileContent) {
    this._fileContent = fileContent;
  }
  get fileContent(): FileContent {
    return this._fileContent;
  }
  get id(): string {
    if (process.env.USE_DISCOVERED_ID) {
      return this.idDiscovered ? this.idDiscovered : this._id;
    } else {
      return this._id;
    }
  }
  asDao(): Dao {
    return asDao(this);
  }
  asView(withStorageInformation: boolean) {
    return asView(this, withStorageInformation);
  }
}
interface Dao {
  id: string;
  revision: number;
  createdAt: string;
  fileContent: any;
  metadata: Metadata;
  validation: any;
  type: any;
  contentStorage: any;
}
function asDao(document: ECMiDocument): Dao {
  return {
    id: document.id,
    revision: document.revision,
    createdAt: document.createdAt,
    fileContent: {
      originalName: document.fileContent.originalName,
      mimeType: document.fileContent.mimeType,
      compressed: document.fileContent.compressed,
    },
    metadata: document.metadata,
    validation: document.validation,
    type: document.type,
    contentStorage: document.contentStorage,
  };
}

function asView(document: ECMiDocument, withStorageInformation = false) {
  return {
    id: document.id,
    revision: document.revision,
    createdAt: document.createdAt,
    fileContent: document.fileContent,
    metadata: document.metadata,
    validation: document.validation,
    type: document.type,
    contentStorage: withStorageInformation
      ? document.contentStorage
      : undefined,
  };
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

export enum Origin {
  LARA = 'LARA',
  API = 'API',
}
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

// export interface ECMDocument extends ECMiDocument {
//    contentStorage: StorageInformation;
// }

export enum FunctionalType {
  BL = 'BL',
  INVOICE = 'INVOICE',
  OTHER = 'OTHER',
}

export interface DocumentType {
  functionalType: string;
  allowRevision: boolean;
}

// export interface BL extends DocumentType {
//   functionalType: FunctionalType.BL;
//   allowRevision: true;
// }
//
// export interface Invoice extends DocumentType {
//   functionalType: FunctionalType.INVOICE;
//   allowRevision: false;
// }

export function allowRevision(document: ECMiDocument) {
  return document.type.allowRevision;
}
