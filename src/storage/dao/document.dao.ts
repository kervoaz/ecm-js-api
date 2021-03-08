'use strict';

import { S3 } from '../../technical/AWSClient';
import {
  CreateBucketRequest,
  GetObjectOutput,
  GetObjectRequest,
  PutObjectRequest,
} from 'aws-sdk/clients/s3';
import { Injectable, Logger } from '@nestjs/common';
import { allowRevision, ECMiDocument } from '../storage.model';
import { MetadataRepository } from './metadata.dao';

@Injectable()
export class DocumentRepository {
  constructor(private readonly metadataRepository: MetadataRepository) {}

  getBucketName() {
    return `${process.env.BUCKET_NAME}`;
  }
  getBucketPrefix(documentType: string) {
    const now = new Date();
    return `${now.getFullYear()}/${(now.getMonth() + 1)
      .toString()
      .padStart(2, '0')}/${now
      .getDate()
      .toString()
      .padStart(2, '0')}/${documentType}`;
  }

  async createNewBucket(bucketName: string = this.getBucketName()) {
    try {
      const createBucketRequest: CreateBucketRequest = {
        Bucket: bucketName,
      };
      const resp = await S3.createBucket(createBucketRequest).promise();
      Logger.debug('Bucket:' + JSON.stringify(resp));
      const versioning = {
        Bucket: bucketName,
        VersioningConfiguration: {
          MFADelete: 'Disabled',
          Status: 'Enabled',
        },
      };
      const respVersion = await S3.putBucketVersioning(versioning).promise();
      Logger.log(
        'Bucket created and versioning activated:' +
          JSON.stringify(respVersion),
      );
    } catch (e) {
      if (e.code !== 'BucketAlreadyOwnedByYou') {
        Logger.error(e);
        throw e;
      } else {
        Logger.debug(`Bucket ${bucketName} already existing`);
      }
    }
  }

  async save(inFile: ECMiDocument): Promise<ECMiDocument> {
    const contentStorage = {
      bucket: this.getBucketName(),
      objectKey: `${this.getBucketPrefix(inFile.type.functionalType)}/${
        inFile.id
      }`,
    };
    const ecmDocument = inFile as ECMiDocument;
    ecmDocument.contentStorage = contentStorage;
    if (!allowRevision(ecmDocument)) {
      let storedDoc;
      try {
        //storedDoc = await this.get(ecmDocument);
        storedDoc = await this.metadataRepository.getLastRevision(
          ecmDocument.id,
        );
      } catch (e) {
        Logger.debug(`Document not already save. It can be stored`);
      }
      //need to check previous revision
      if (storedDoc) {
        throw new Error(
          `[ERR_DOC_NOVERSION] ${ecmDocument.id} ${JSON.stringify(
            ecmDocument.type,
          )} doesn't allow multiple revision. Already stored with revision ${
            storedDoc.revision
          }`,
        );
      }
    }
    const putObjectRequest: PutObjectRequest = {
      Body: ecmDocument.fileContent.content,
      Bucket: ecmDocument.contentStorage.bucket,
      Key: ecmDocument.contentStorage.objectKey,
      Metadata: ecmDocument.metadata,
    };
    let respPutObj;
    try {
      respPutObj = await S3.putObject(putObjectRequest).promise();
    } catch (e) {
      if (e.code === 'NoSuchBucket') {
        Logger.warn(`Bucket doesn't exist, try to create it`, e);
        await this.createNewBucket();
        respPutObj = await S3.putObject(putObjectRequest).promise();
      } else {
        Logger.error(`Error putting document: `, e);
        throw e;
      }
    }
    if (respPutObj.VersionId) {
      ecmDocument.contentStorage.versionId = respPutObj.VersionId;
    }
    Logger.debug('Object:' /*+ JSON.stringify(respObj)*/);
    return ecmDocument;
  }

  async get(ecmFile: ECMiDocument): Promise<ECMiDocument> {
    const getObjectRequest: GetObjectRequest = {
      Bucket: ecmFile.contentStorage.bucket,
      Key: ecmFile.contentStorage.objectKey,
      VersionId: ecmFile.contentStorage.versionId,
    };
    const s3Doc: GetObjectOutput = await S3.getObject(
      getObjectRequest,
    ).promise();
    ecmFile.fileContent = {
      mimeType: '',
      originalName: '',
      content: s3Doc.Body as Buffer,
      compressed: false,
    };
    return ecmFile;
  }
}
