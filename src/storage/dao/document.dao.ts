'use strict';

import { S3 } from '../../technical/AWSClient';
import {
  CreateBucketRequest,
  GetObjectOutput,
  GetObjectRequest,
  PutObjectRequest,
} from 'aws-sdk/clients/s3';
import { Logger } from '@nestjs/common';
import { allowRevision, Document, ECMDocument } from '../storage.model';

const BUCKET_NAME = 'create-by-api'; //TODO parameter

function getBucketPrefix() {
  const now = new Date();
  return `${now.getFullYear()}/${(now.getMonth() + 1)
    .toString()
    .padStart(2, '0')}/${now.getDate().toString().padStart(2, '0')}`;
}
async function createNewBucket(bucketName: string = BUCKET_NAME) {
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
      'Bucket created and versioning activated:' + JSON.stringify(respVersion),
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

export async function save(inFile: Document): Promise<ECMDocument> {
  const contentStorage = {
    bucket: BUCKET_NAME,
    objectKey: `${getBucketPrefix()}/${inFile.id}`,
  };
  const ecmDocument = inFile as ECMDocument;
  ecmDocument.contentStorage = contentStorage;
  if (!allowRevision(ecmDocument)) {
    throw new Error(
      `[ERR_DOC_NOVERSION] ${ecmDocument.id} ${JSON.stringify(
        ecmDocument.type,
      )} doesn't allow multiple revision`,
    );
  }
  const putObjectRequest: PutObjectRequest = {
    Body: ecmDocument.fileContent.content,
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
    VersionId: ecmFile.contentStorage.versionId,
  };
  const s3Doc: GetObjectOutput = await S3.getObject(getObjectRequest).promise();
  ecmFile.fileContent = {
    mimeType: '',
    originalName: '',
    content: s3Doc.Body as Buffer,
    compressed: false,
  };
  return ecmFile;
}
