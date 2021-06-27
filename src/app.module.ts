import { HttpModule, Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AppController } from './app.controller';
import { StorageService } from './storage/storage.service';
import { ValidationService } from './integrity/validation.service';
import { MetadataRepository } from './storage/dao/metadata.dao';
import { AppService } from './app.service';
import { DocumentRepository } from './storage/dao/document.dao';
import { IndexerService } from './indexer/indexer.service';
import { ElasticClient } from './technical/ElasticSearchClient';
import { SecretManager } from './technical/secretsManagerDao';

@Module({
  imports: [ConfigModule.forRoot({ envFilePath: 'dev.env' }), HttpModule],
  controllers: [AppController],
  providers: [
    StorageService,
    ValidationService,
    MetadataRepository,
    DocumentRepository,
    AppService,
    IndexerService,
    ElasticClient,
    SecretManager,
  ],
})
export class AppModule {}
