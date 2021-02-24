import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AppController } from './app.controller';
import { StorageService } from './storage/storage.service';
import { AnalyzerService } from './integrity/analyzer.service';
import { ValidationService } from './integrity/validation.service';
import { MetadataRepository } from './storage/dao/metadata.dao';

@Module({
  imports: [ConfigModule.forRoot({ envFilePath: 'dev.env' })],
  controllers: [AppController],
  providers: [
    StorageService,
    AnalyzerService,
    ValidationService,
    MetadataRepository,
  ],
})
export class AppModule {}
