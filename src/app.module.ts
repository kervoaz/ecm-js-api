import { HttpModule, Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AppController } from './app.controller';
import { StorageService } from './storage/storage.service';
import { MimeRouterService } from './integrity/mime-router.service';
import { ValidationService } from './integrity/validation.service';
import { MetadataRepository } from './storage/dao/metadata.dao';
import { ContentAnalyzerService } from './integrity/content-analyzer.service';
import { AnalyzerPDFService } from './integrity/analyzerPDF.service';
import { AppService } from './app.service';
import { DocumentRepository } from './storage/dao/document.dao';

@Module({
  imports: [ConfigModule.forRoot({ envFilePath: 'dev.env' }), HttpModule],
  controllers: [AppController],
  providers: [
    StorageService,
    MimeRouterService,
    ValidationService,
    MetadataRepository,
    DocumentRepository,
    ContentAnalyzerService,
    MimeRouterService,
    AnalyzerPDFService,
    AppService,
  ],
})
export class AppModule {}
