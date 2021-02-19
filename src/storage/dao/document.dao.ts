'use strict';

import { S3 } from '../../technical/AWSClient';
import { CreateBucketRequest, PutObjectRequest } from 'aws-sdk/clients/s3';
import { Logger } from '../../technical/Logger';
import { ECMFile, isVersionnable } from '../storage.model';

export async function save(eFile: ECMFile): Promise<ECMFile> {
  const createBucketRequest: CreateBucketRequest = {
    Bucket: eFile.fileLink.bucket,
  };
  try {
    const resp = await S3.createBucket(createBucketRequest).promise();
    Logger.debug('Bucket:' + JSON.stringify(resp));
    const versioning = {
      Bucket: eFile.fileLink.bucket,
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
      Logger.debug(`Bucket ${eFile.fileLink.bucket} already existing`);
    }
  }
  if (!isVersionnable(eFile.docType)) {
    throw new Error(
      `[ERR_DOC_NOVERSION] ${JSON.stringify(
        eFile,
      )} doesn't allow multiple revision`,
    );
  }
  const putObjectRequest: PutObjectRequest = {
    Body: eFile.fileContent,
    Bucket: eFile.fileLink.bucket,
    Key: eFile.fileLink.objectKey,
    Metadata: eFile.metadata,
  };
  const respObj = await S3.putObject(putObjectRequest).promise();
  if (respObj.VersionId) {
    eFile.fileLink.versionId = respObj.VersionId;
  }
  Logger.debug('Object:' /*+ JSON.stringify(respObj)*/);
  return eFile;
}
