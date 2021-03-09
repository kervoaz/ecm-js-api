'use strict';

import { ssm } from './AWSClient';

export async function createSecret(name: string, secretAsString: string) {
  const request = {
    Name: name,
    Value: secretAsString,
    Type: 'SecureString',
  };

  try {
    return await ssm.putParameter(request).promise();
  } catch (e) {
    throw new Error('Failed during secretManagerDao.createSecret ' + e.message);
  }
}

export async function upsertSecret(name: string, secretAsString: string) {
  const request = {
    Name: name,
    Value: secretAsString,
    Type: 'SecureString',
    Overwrite: true,
  };

  try {
    return await ssm.putParameter(request).promise();
  } catch (e) {
    throw new Error('Failed during secretManagerDao.upsertSecret ' + e.message);
  }
}

/**
 * delete a secret without recovery period
 * warning: the same secret cannot be recreated immediately(aws behavior)
 * @param name
 */
export async function deleteSecret(name) {
  const request = {
    Name: name,
  };

  try {
    return await ssm.deleteParameter(request).promise();
  } catch (e) {
    throw new Error('Failed during secretManagerDao.deleteSecret ' + e.message);
  }
}

export async function getSecret(name) {
  const request = {
    Name: name,
    WithDecryption: true,
  };

  try {
    const result = await ssm.getParameter(request).promise();
    if (result.Parameter) {
      return result.Parameter.Value;
    } else {
      throw new Error('No parameter with name ' + name + ' found');
    }
  } catch (e) {
    throw new Error('Failed during secretManagerDao.getSecret ' + e.message);
  }
}
