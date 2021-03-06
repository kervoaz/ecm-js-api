import { Injectable, Logger } from '@nestjs/common';
import Ajv from 'ajv';
import { FunctionalType, Metadata } from '../storage/storage.model';
import { InvoiceSchema } from '../../resources/InvoiceSchema';
import { BLSchema } from '../../resources/BLSchema';
import { OtherSchema } from '../../resources/OtherSchema';

@Injectable()
export class ValidationService {
  validate(
    data: Metadata,
  ): { isValid: boolean; errors?: any[]; documentType: any } {
    const ajv = new Ajv(); // options can be passed, e.g. {allErrors: true}
    let validator;
    let documentType;
    switch (data['dDocType']) {
      case FunctionalType.INVOICE:
        validator = ajv.compile(InvoiceSchema);
        documentType = {
          functionalType: data['dDocType'],
          allowRevision: false,
        };
        break;
      case FunctionalType.BL:
        validator = ajv.compile(BLSchema);
        documentType = {
          functionalType: data['dDocType'],
          allowRevision: this.asBoolean(
            validator.schema.properties.allowRevision.const.toLowerCase(),
          ),
        };
        break;
      default:
        Logger.warn(`document type found is ${data['dDocType']}`);
        validator = ajv.compile(OtherSchema);
        documentType = {
          functionalType: data['dDocType'],
          allowRevision: true,
        };
        break;
    }
    const valid = validator(data);
    if (!valid) console.log(validator.errors);
    return { isValid: valid, errors: validator.errors, documentType };
  }

  asBoolean(boolAsString: string) {
    return boolAsString.toLowerCase() === 'true';
  }
}
