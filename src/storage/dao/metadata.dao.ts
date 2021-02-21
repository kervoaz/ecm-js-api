'use strict';

import { docClient } from '../../technical/AWSClient';
import { Logger } from '../../technical/Logger';
import { DocType, ECMFile } from '../storage.model';
import { DocumentClient } from 'aws-sdk/lib/dynamodb/document_client';

import QueryInput = DocumentClient.QueryInput;

interface DocumentDTO {
  id: string;
  revision: number;
  docType: DocType;
  fileLink: { bucket: string; objectKey: string; versionId: string };
  createdAt: string;
}

function toDTO(eFile: ECMFile): DocumentDTO {
  return {
    createdAt: eFile.createdAt,
    revision: eFile.revision,
    docType: eFile.docType,
    fileLink: {
      bucket: eFile.fileLink.bucket,
      objectKey: eFile.fileLink.objectKey,
      versionId: eFile.fileLink.versionId,
    },
    id: eFile.id,
  };
}

const TABLE_NAME = 'ecm-dev-documents'; //process.env.DOCUMENTS_TABLE_NAME; //ecm-dev-documents

export async function save(eFile: ECMFile) {
  const previousStoredDocument = await getLastRevision(eFile.id);
  if (previousStoredDocument) {
    eFile.revision = previousStoredDocument.revision + 1;
  }
  const documentDTO: DocumentDTO = toDTO(eFile);
  if (documentDTO === undefined) {
    throw new Error(`[ERR_DOC_SAVE]:documentDTO cannot be empty`);
  }
  try {
    const now = new Date().toISOString();
    const param = {
      TableName: TABLE_NAME,
      Item: {
        id: documentDTO.id,
        docType: documentDTO.docType,
        fileLink: documentDTO.fileLink,
        createdAt:
          documentDTO.createdAt === undefined ? now : documentDTO.createdAt,
        revision: documentDTO.revision,
        updatedAt: now,
      },
    };
    return (await docClient.put(param).promise()).Attributes;
  } catch (err) {
    Logger.error(err);
    throw new Error(
      `Failed during save documentDTO ${JSON.stringify(documentDTO)} ${
        err.message
      }`,
    );
  }
}

export async function list(id: string): Promise<Array<DocumentDTO>> {
  try {
    const param: QueryInput = {
      TableName: TABLE_NAME,
      KeyConditionExpression: `#id=:idToSearch`,
      ExpressionAttributeNames: { '#id': 'id' },
      ExpressionAttributeValues: { ':idToSearch': id },
    };
    Logger.trace(`[DBAccess] retrieve document for key:${id}`);
    return <Array<DocumentDTO>>(
      (<unknown>(await docClient.query(param).promise()).Items)
    );
  } catch (e) {
    Logger.error(`[ERR_DOC_GET] error getting document ${id}`);
    throw e;
  }
}
export async function getLastRevision(id: string): Promise<DocumentDTO> {
  const sorted = (await list(id)).sort((a, b) => a.revision - b.revision);
  return sorted[sorted.length - 1];
}
