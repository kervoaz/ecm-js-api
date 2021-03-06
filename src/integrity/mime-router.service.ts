import { PDFDocument } from 'pdf-lib';
import { Injectable, Logger } from '@nestjs/common';
import { ECMiDocument, FunctionalType } from '../storage/storage.model';
import { AnalyzerPDFService } from './analyzerPDF.service';
import { ElasticClient } from '../technical/ElasticSearchClient';
import { generateUUID } from '../technical/Utils';
// eslint-disable-next-line @typescript-eslint/no-var-requires
const parser = require('fast-xml-parser');
// eslint-disable-next-line @typescript-eslint/no-var-requires
const he = require('he');
// eslint-disable-next-line @typescript-eslint/no-var-requires
const jp = require('jsonpath');
@Injectable()
export class MimeRouterService {
  constructor(private readonly analyzerPDFService: AnalyzerPDFService) {}

  async analyze(document: ECMiDocument) {
    if (document.fileContent.mimeType.includes('pdf')) {
      await this.analyzerPDFService.analyze(document);
    } else {
      document.addMetadata({ dDocType: FunctionalType.OTHER });
      Logger.warn(`not a pdf`);
      const options = {
        attributeNamePrefix: '@_',
        attrNodeName: 'attr', //default is 'false'
        textNodeName: '#text',
        ignoreAttributes: true,
        ignoreNameSpace: false,
        allowBooleanAttributes: false,
        parseNodeValue: true,
        parseAttributeValue: false,
        trimValues: true,
        cdataTagName: '__cdata', //default is 'false'
        cdataPositionChar: '\\c',
        parseTrueNumberOnly: false,
        arrayMode: false, //"strict"
        attrValueProcessor: (val, attrName) =>
          he.decode(val, { isAttributeValue: true }), //default is a=>a
        tagValueProcessor: (val, tagName) => he.decode(val), //default is a=>a
        stopNodes: ['parse-me-as-string'],
      };
      try {
        const jsonObj = parser.parse(
          document.documentAnalyzis.parsed,
          options,
          true,
        );
        const filtereds: Array<any> = jp.query(jsonObj, '$..tbody');
        for (const filtered of filtereds) {
          if (
            JSON.stringify(filtered).includes('Covers') &&
            JSON.stringify(filtered).includes('Verification')
          ) {
            let newFiltered = jp.query(filtered, '$..tr');
            newFiltered = jp.query(newFiltered, '$..td');
            newFiltered = jp.query(newFiltered, '$..p');
            const elasticClient = new ElasticClient();
            await elasticClient.build().index({
              index: 'zoucompany',
              id: generateUUID(),
              body: { header: toIndexable(newFiltered) },
            });
          }
        }
      } catch (error) {
        Logger.error(`${error.message}`);
      }
    }
  }
}
function toIndexable(arrayOfAny: any[]) {
  return arrayOfAny.map((x) => {
    return typeof x !== 'string' ? JSON.stringify(x) : x;
  });
}
