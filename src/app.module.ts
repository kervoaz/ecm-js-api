import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AppController } from './app.controller';
import { StorageService } from './storage/storage.service';
import { AnalyzerService } from './integrity/analyzer.service';

@Module({
  imports: [ConfigModule.forRoot({ envFilePath: '.dev.env' })],
  controllers: [AppController],
  providers: [StorageService, AnalyzerService],
})
export class AppModule {}
