import { Injectable } from '@nestjs/common';
import { ParserService } from './integrity/parser.service';
import { AnalyzerService } from './integrity/analyzer.service';
import { ECMiDocument } from './storage/storage.model';

@Injectable()
export class AppService {
  constructor(
    private readonly parserService: ParserService,
    private readonly analyzerService: AnalyzerService,
  ) {}

  async main(document: ECMiDocument): Promise<ECMiDocument> {
    const xml = await this.parserService.parse(document);
    document.documentAnalyzis = { parsed: xml.data };
    await this.analyzerService.analyze(document);
    return document;
  }
}
