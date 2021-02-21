'use strict';

import { docClient } from '../../technical/AWSClient';
import { Logger } from '../../technical/Logger';
import { ECMDocument } from '../storage.model';
import { DocumentClient } from 'aws-sdk/lib/dynamodb/document_client';
import QueryInput = DocumentClient.QueryInput;



const TABLE_NAME = 'ecm-dev-documents'; //process.env.DOCUMENTS_TABLE_NAME; //ecm-dev-documents

export async function save(eFile: ECMDocument) {
  const previousStoredDocument = await getLastRevision(eFile.id);
  if (previousStoredDocument) {
    eFile.revision = previousStoredDocument.revision + 1;
  }
  if (eFile === undefined) {
    throw new Error(`[ERR_DOC_SAVE]:documentDTO cannot be empty`);
  }
  try {
    const now = new Date().toISOString();
    const param = {
      TableName: TABLE_NAME,
      Item: eFile,
    };
    return (await docClient.put(param).promise()).Attributes;
  } catch (err) {
    Logger.error(err);
    throw new Error(
      `Failed during save documentDTO ${JSON.stringify(eFile)} ${err.message}`,
    );
  }
}

export async function list(id: string): Promise<Array<ECMDocument>> {
  try {
    const param: QueryInput = {
      TableName: TABLE_NAME,
      KeyConditionExpression: `#id=:idToSearch`,
      ExpressionAttributeNames: { '#id': 'id' },
      ExpressionAttributeValues: { ':idToSearch': id },
    };
    Logger.trace(`[DBAccess] retrieve document for key:${id}`);
    return <Array<ECMDocument>>(
      (<unknown>(await docClient.query(param).promise()).Items)
    );
  } catch (e) {
    Logger.error(`[ERR_DOC_GET] error getting document ${id}`);
    throw e;
  }
}

export async function getLastRevision(id: string): Promise<ECMDocument> {
  const sorted = (await list(id)).sort((a, b) => a.revision - b.revision);
  return sorted[sorted.length - 1];
}
