import { Injectable } from '@nestjs/common';
import { ECMDocument } from '../storage/storage.model';
import { ElasticClient } from '../technical/ElasticSearchClient';
import { Logger } from '../technical/Logger';

@Injectable()
export class IndexerService {
  constructor(private elasticClient: ElasticClient) {}
  INDEX_PREFIX = 'eventhub-docstore';
  async indexDocument(ecmDocument: ECMDocument) {
    const currentIndex = getIndex(this.INDEX_PREFIX, ecmDocument);
    try {
      // const elasticClient = new ElasticClient();
      await this.elasticClient.prepare();
      await this.elasticClient.build().index({
        index: currentIndex,
        id: `${ecmDocument.id}-${ecmDocument.revision}`,
        body: ecmDocument.asIndexable(),
      });
      Logger.debug(`document ${ecmDocument.id} indexed ${currentIndex}`);
    } catch (e) {
      Logger.error(
        `Error pushing document ${
          ecmDocument.id
        } into ${currentIndex} ${getRootCauseError(e)} `,
        e,
      );
    }
  }
}
function getIndex(indexPrefix: string, ecmDocument: ECMDocument) {
  const docDate = new Date(ecmDocument.createdAt);
  return `${indexPrefix}-${process.env.ENV}-${docDate.getFullYear()}`;
}
function getRootCauseError(error: any): string | undefined {
  if (error && error.meta && error.meta.body && error.meta.body.error) {
    return JSON.stringify(error.meta.body.error.root_cause);
  }
}
