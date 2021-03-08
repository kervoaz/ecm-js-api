'use strict';

import { docClient } from '../../technical/AWSClient';
import { ECMiDocument } from '../storage.model';
import { DocumentClient } from 'aws-sdk/lib/dynamodb/document_client';
import QueryInput = DocumentClient.QueryInput;
import GetItemInput = DocumentClient.GetItemInput;
import { Injectable, Logger } from '@nestjs/common';

@Injectable()
export class MetadataRepository {
  private tableName: string = process.env.DOCUMENTS_TABLE_NAME;

  async save(eFile: ECMiDocument): Promise<ECMiDocument> {
    const previousStoredDocument = await this.getLastRevision(eFile.id);
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
        TableName: this.tableName,
        Item: eFile.asDao(),
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

  async list(id: string): Promise<Array<ECMiDocument>> {
    try {
      const param: QueryInput = {
        TableName: this.tableName,
        KeyConditionExpression: `#id=:idToSearch`,
        ExpressionAttributeNames: { '#id': 'id' },
        ExpressionAttributeValues: { ':idToSearch': id },
      };
      Logger.debug(`[DBAccess] retrieve document for key:${id}`);
      return <Array<ECMiDocument>>(
        (<unknown>(await docClient.query(param).promise()).Items)
      );
    } catch (e) {
      Logger.error(`[ERR_DOC_GET] error getting document ${id}`);
      throw e;
    }
  }

  async get(id: string, revision: number): Promise<ECMiDocument> {
    try {
      const param: GetItemInput = {
        TableName: this.tableName,
        Key: { id, revision },
      };
      Logger.debug(`[DBAccess] retrieve document for key:${id} ${revision}`);
      const res = await docClient.get(param).promise();
      return <ECMiDocument>(<unknown>res.Item);
    } catch (e) {
      Logger.error(`[ERR_DOC_GET] error getting document ${id} ${revision}`);
      throw e;
    }
  }

  async getLastRevision(id: string): Promise<ECMiDocument> {
    const sorted = (await this.list(id)).sort(
      (a, b) => a.revision - b.revision,
    );
    return sorted[sorted.length - 1];
  }
}
