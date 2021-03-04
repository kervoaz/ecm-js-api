import { xml2Json } from '../technical/Utils';

export class ECMiDocument {
  type?: DocumentType;
  revision?: number;
  metadata?: Metadata;
  createdAt: string;
  updatedAt?: string;
  storageInformation?: StorageInformation;
  documentAnalyzis: { parsed: string };
  constructor(
    readonly id: string,
    readonly fileContent: {
      content: Buffer;
      originalName: string;
      mimeType: string;
      compressed: boolean;
    },
  ) {
    this.createdAt = new Date().toISOString();
    this.fileContent = fileContent;
  }
  toString(): string {
    return JSON.stringify(this);
  }
  asJson() {
    this.documentAnalyzis.parsed = xml2Json(this.documentAnalyzis.parsed);
  }
  addMetadata(metaToAdd: Metadata) {
    this.metadata = new Map([...this.metadata, ...metaToAdd]);
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

export type Metadata = Map<string, string>;

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
