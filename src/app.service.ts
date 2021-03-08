import { Injectable, Logger } from '@nestjs/common';
import { ContentAnalyzerService } from './integrity/content-analyzer.service';
import { MimeRouterService } from './integrity/mime-router.service';
import { ECMiDocument } from './storage/storage.model';
import { ValidationService } from './integrity/validation.service';

@Injectable()
export class AppService {
  constructor(
    private readonly contentAnalyzerService: ContentAnalyzerService,
    private readonly mimeRouterService: MimeRouterService,
    private readonly validationService: ValidationService,
  ) {}

  async main(document: ECMiDocument): Promise<ECMiDocument> {
    // try {
    const xml = await this.contentAnalyzerService.extract(document);
    document.documentAnalyzis = { parsed: xml.data };
    await this.mimeRouterService.analyze(document);
    const validation = this.validationService.validate(document.metadata);
    document.validation = {
      isValid: validation.isValid,
      errors: validation.errors,
    };
    document.type = validation.documentType;
    // } catch (e) {
    //   Logger.error(e);
    //   if (document.documentAnalyzis) {
    //     document.documentAnalyzis.error = `${e.message}`;
    //   } else {
    //     document.documentAnalyzis = {
    //       parsed: undefined,
    //       error: `${e.message}`,
    //     };
    //   }
    // }
    return document;
  }
}
