export interface ECMFile {
  id: string;
  docType: DocType;
  fileContent: Buffer;
  metadata: { [key: string]: string };
  fileLink: {
    bucket: string;
    objectKey: string;
    versionId?: string;
    originalName: string;
    mimeType: string;
  };
  revision: number;
  createdAt?: string;
}

export enum DocType {
  BL = 'BL',
  INVOICE = 'INVOICE',
}

export function isVersionnable(docType: DocType) {
  if (docType === DocType.BL) {
    return true;
  } else {
    return false;
  }
}
