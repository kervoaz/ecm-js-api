import { HttpModule, Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AppController } from './app.controller';
import { StorageService } from './storage/storage.service';
import { AnalyzerService } from './integrity/analyzer.service';
import { ValidationService } from './integrity/validation.service';
import { MetadataRepository } from './storage/dao/metadata.dao';
import { ParserService } from './integrity/parser.service';
import { AnalyzerPDFService } from './integrity/analyzerPDF.service';
import { AppService } from './app.service';

@Module({
  imports: [ConfigModule.forRoot({ envFilePath: 'dev.env' }), HttpModule],
  controllers: [AppController],
  providers: [
    StorageService,
    AnalyzerService,
    ValidationService,
    MetadataRepository,
    ParserService,
    AnalyzerService,
    AnalyzerPDFService,
    AppService,
  ],
})
export class AppModule {}
