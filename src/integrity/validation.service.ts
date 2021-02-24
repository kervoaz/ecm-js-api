import { Injectable } from '@nestjs/common';
import Ajv from "ajv";

@Injectable()
export class ValidationService {
 
  
  validate(data) {
    const ajv = new Ajv() // options can be passed, e.g. {allErrors: true}
    const validateBL = ajv.compile(BLSchema)
    const valid = validateBL(data)
    if (!valid) console.log(validateBL.errors)
  }
}
export const BLSchema={
    "$schema": "http://json-schema.org/draft-07/schema#",
    "$id": "http://example.com/product.schema.json",
    "title": "Product",
    "description": "A product from Acme's catalog",
    "type": "object",
    "properties": {
      "productId": {
        "description": "The unique identifier for a product",
        "type": "integer"
      },
      "productName": {
        "description": "Name of the product",
        "type": "string"
      }
    },
    "required": [ "productId", "productName" ]
  };
