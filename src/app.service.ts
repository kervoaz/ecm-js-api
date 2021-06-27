import { Injectable, Logger } from '@nestjs/common';
import { ECMDocument } from './storage/storage.model';
import { ValidationService } from './integrity/validation.service';

@Injectable()
export class AppService {
  constructor(private readonly validationService: ValidationService) {}

  async main(document: ECMDocument): Promise<ECMDocument> {
    const validation = this.validationService.validate(document.metadata);
    document.validation = {
      isValid: validation.isValid,
      errors: validation.errors,
    };
    document.type = validation.documentType;
    return document;
  }
}
