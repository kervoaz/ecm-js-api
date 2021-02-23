'use strict';

import { docClient } from '../../technical/AWSClient';
import { ECMDocument } from '../storage.model';
import { DocumentClient } from 'aws-sdk/lib/dynamodb/document_client';
import QueryInput = DocumentClient.QueryInput;
import GetItemInput = DocumentClient.GetItemInput;
import { Logger } from '@nestjs/common';

const TABLE_NAME = 'ecm-dev-documents'; //process.env.DOCUMENTS_TABLE_NAME; //ecm-dev-documents

export async function save(eFile: ECMDocument): Promise<ECMDocument> {
  const previousStoredDocument = await getLastRevision(eFile.id);
  if (previousStoredDocument) {
    eFile.revision = previousStoredDocument.revision + 1;
  } else {
    eFile.revision = 1;
  }
  if (eFile === undefined) {
    throw new Error(`[ERR_DOC_SAVE]:documentDTO cannot be empty`);
  }
  try {
    const now = new Date().toISOString();
    eFile.createdAt = now;
    delete eFile.fileContent.content; //don't store the content in Dynamo
    const param = {
      TableName: TABLE_NAME,
      Item: eFile,
    };
    await docClient.put(param).promise();
    return eFile;
  } catch (err) {
    Logger.error(err);
    throw new Error(
      `Failed during save documentDTO ${eFile.id} ${err.message}`,
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
    Logger.debug(`[DBAccess] retrieve document for key:${id}`);
    return <Array<ECMDocument>>(
      (<unknown>(await docClient.query(param).promise()).Items)
    );
  } catch (e) {
    Logger.error(`[ERR_DOC_GET] error getting document ${id}`);
    throw e;
  }
}

export async function get(id: string, revision: number): Promise<ECMDocument> {
  try {
    const param: GetItemInput = {
      TableName: TABLE_NAME,
      Key: { id, revision },
    };
    Logger.debug(`[DBAccess] retrieve document for key:${id} ${revision}`);
    const res = await docClient.get(param).promise();
    return <ECMDocument>(<unknown>res.Item);
  } catch (e) {
    Logger.error(`[ERR_DOC_GET] error getting document ${id} ${revision}`);
    throw e;
  }
}

export async function getLastRevision(id: string): Promise<ECMDocument> {
  const sorted = (await list(id)).sort((a, b) => a.revision - b.revision);
  return sorted[sorted.length - 1];
}
