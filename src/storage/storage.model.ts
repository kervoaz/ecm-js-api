export interface Document {
  id: string;
  type?: DocumentType;
  revision?: number;
  metadata?: Metadata;
  createdAt: string;
  updatedAt?: string;
  fileContent?: { content: Buffer; originalName: string; mimeType: string };
}

export interface Metadata {
  [key: string]: string;
}

export interface StorageInformation {
  bucket: string;
  objectKey: string;
  versionId?: string;
}

export interface ECMDocument extends Document {
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

export function allowRevision(document: Document) {
  return document.type.allowRevision;
}
