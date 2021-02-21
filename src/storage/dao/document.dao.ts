'use strict';

import { S3 } from '../../technical/AWSClient';
import { CreateBucketRequest, GetObjectRequest, PutObjectRequest } from 'aws-sdk/clients/s3';
import { Logger } from '../../technical/Logger';
import { allowRevision, Document, ECMDocument } from '../storage.model';
import { generateUID } from '../storage.service';


function getBucketPrefix() {
  const now = new Date();
  return `${now.getFullYear()}/${(now.getMonth() + 1)
    .toString()
    .padStart(2, '0')}/${now.getDate().toString().padStart(2, '0')}`;
}

export async function save(inFile: Document): Promise<ECMDocument> {
  const contentStorage = {
    bucket: getBucketPrefix(),
    objectKey: `${generateUID('zou')}-${inFile.fileContent.originalName}`,
  };
  const ecmDocument = inFile as ECMDocument;
  ecmDocument.contentStorage = contentStorage;

  const createBucketRequest: CreateBucketRequest = {
    Bucket: ecmDocument.contentStorage.bucket,
  };
  try {
    const resp = await S3.createBucket(createBucketRequest).promise();
    Logger.debug('Bucket:' + JSON.stringify(resp));
    const versioning = {
      Bucket: ecmDocument.contentStorage.bucket,
      VersioningConfiguration: {
        MFADelete: 'Disabled',
        Status: 'Enabled',
      },
    };
    const respVersion = await S3.putBucketVersioning(versioning).promise();
    Logger.info(
      'Bucket created and versioning activated:' + JSON.stringify(respVersion),
    );
  } catch (e) {
    if (e.code !== 'BucketAlreadyOwnedByYou') {
      Logger.error(e);
      throw e;
    } else {
      Logger.debug(
        `Bucket ${ecmDocument.contentStorage.bucket} already existing`,
      );
    }
  }
  if (!allowRevision(ecmDocument)) {
    throw new Error(
      `[ERR_DOC_NOVERSION] ${JSON.stringify(
        ecmDocument,
      )} doesn't allow multiple revision`,
    );
  }
  const putObjectRequest: PutObjectRequest = {
    Body: ecmDocument.fileContent,
    Bucket: ecmDocument.contentStorage.bucket,
    Key: ecmDocument.contentStorage.objectKey,
    Metadata: ecmDocument.metadata,
  };
  const respObj = await S3.putObject(putObjectRequest).promise();
  if (respObj.VersionId) {
    ecmDocument.contentStorage.versionId = respObj.VersionId;
  }
  Logger.debug('Object:' /*+ JSON.stringify(respObj)*/);
  return ecmDocument;
}

export async function get(ecmFile: ECMDocument): Promise<ECMDocument> {
  const getObjectRequest: GetObjectRequest = {
    Bucket: ecmFile.contentStorage.bucket,
    Key: ecmFile.contentStorage.objectKey,
  };
  const s3Doc = await S3.getObject(getObjectRequest).promise();
  ecmFile.fileContent.content = Buffer.from(s3Doc);
  return ecmFile;
}
