import { Client } from '@elastic/elasticsearch';
import { CacheService } from './CacheService';
import CacheType = CacheService.CacheType;
import { Injectable } from '@nestjs/common';
import { SecretManager } from './secretsManagerDao';

// const parameterStorePrefix = 'document-store';

@Injectable()
export class ElasticClient {
  constructor(private readonly secretManager: SecretManager) {}
  private parameterStorePrefix = `/papi/${process.env.ENV}`;
  private user: string;
  private password: string;
  private client: Client;

  async prepare() {
    let elasticUser = await CacheService.get(
      CacheType.CREDENTIAL,
      'elasticUser',
    );
    let elasticPassword = await CacheService.get(
      CacheType.CREDENTIAL,
      'elasticPassword',
    );
    if (!elasticUser) {
      try {
        elasticUser = await this.secretManager.getSecret(
          `${this.parameterStorePrefix}/elastic/user`,
        );
        elasticPassword = await this.secretManager.getSecret(
          `${this.parameterStorePrefix}/elastic/password`,
        );
      } catch (e) {
        throw new Error(
          `User or password not configured for ${this.parameterStorePrefix}/elastic/user`,
        );
      }
      await CacheService.put(CacheType.CREDENTIAL, 'elasticUser', elasticUser);
      await CacheService.put(
        CacheType.CREDENTIAL,
        'elasticPassword',
        elasticPassword,
      );
    }
    this.user = elasticUser;
    this.password = elasticPassword;
  }
  build() {
    return new Client({
      node: process.env.DOCUMENT_EXTRACT_URL,
      maxRetries: 2,
      requestTimeout: 10000,
      ssl: {
        rejectUnauthorized: false,
      },
      auth: {
        username: this.user,
        password: this.password,
      },
    });
  }
}
