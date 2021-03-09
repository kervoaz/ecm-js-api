import { Client } from '@elastic/elasticsearch';
import { getSecret } from './secretsManagerDao';
import { CacheService } from './CacheService';
import CacheType = CacheService.CacheType;

const parameterStorePrefix = 'document-store';
export class ElasticClient {
  private user: string;
  private password: string;
  private client: Client;

  async prepare() {
    let elasticUser = await CacheService.get(
      CacheType.CREDENTIAL,
      'elasticUser',
    );
    let elasticPassword;
    if (!elasticUser) {
      try {
        elasticUser = await getSecret(`${parameterStorePrefix}/elastic/user`);
        elasticPassword = await getSecret(
          `${parameterStorePrefix}/elastic/password`,
        );
      } catch (e) {
        throw new Error(
          `User or password not configured for ${parameterStorePrefix}`,
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
