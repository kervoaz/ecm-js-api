import { MetadataValue } from 'aws-sdk/clients/s3';
import { getHash } from '../technical/Utils';
import { doc } from 'prettier';

export class ECMDocument {
  type?: DocumentType;
  revision?: number;
  metadata?: Metadata;
  createdAt: string;
  origin: Origin;
  private _fileContent: FileContent;
  private readonly _id: string;
  updatedAt?: string;
  contentStorage: StorageInformation;
  validation?: { isValid: boolean; errors?: any[] };
  constructor(id: string, fileContent: FileContent) {
    this._id = getHash(id);
    this.createdAt = new Date().toISOString();
    this._fileContent = fileContent;
  }
  toString(): string {
    return JSON.stringify(this);
  }

  addMetadata(metaToAdd: Metadata) {
    this.metadata = { ...this.metadata, ...metaToAdd };
  }
  set fileContent(fileContent: FileContent) {
    this._fileContent = fileContent;
  }
  get fileContent(): FileContent {
    return this._fileContent;
  }
  get id(): string {
    return this._id;
  }
  asDao(): Dao {
    return asDao(this);
  }
  asView(withStorageInformation: boolean) {
    return asView(this, withStorageInformation);
  }
  asIndexable() {
    return asIndexable(this);
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
function asDao(document: ECMDocument): Dao {
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

export function asView(document: ECMDocument, withStorageInformation = false) {
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

export function asIndexable(document: ECMDocument) {
  return {
    id: document.id,
    createdAt: document.createdAt,
    fileContent: {
      mimeType: document.fileContent.mimeType,
      originalName: document.fileContent.originalName,
      compressed: document.fileContent.compressed,
    },
    metadata: document.metadata,
    origin: document.origin,
    validation: document.validation,
    type: document.type,
    contentStorage: document.contentStorage,
    revision: document.revision,
  };
}

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

export function allowRevision(document: ECMDocument) {
  return document.type.allowRevision;
}
