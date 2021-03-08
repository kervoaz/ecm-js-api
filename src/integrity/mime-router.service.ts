import { PDFDocument } from 'pdf-lib';
import { Injectable, Logger } from '@nestjs/common';
import { ECMiDocument } from '../storage/storage.model';
import { AnalyzerPDFService } from './analyzerPDF.service';
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
          document.fileContent.content.toString('utf8'),
          options,
          true,
        );
        const filtered: Array<any> = jp.query(jsonObj, '$..tbody');
        filtered.forEach((x) => {
          if (JSON.stringify(x).includes('MBD_X4_BPTU_ETS_0074')) {
            Logger.debug(JSON.stringify(x['tr']));
          }
        });
        //filtered = jp.query(filtered, '$..tr');
        //filtered = jp.query(filtered, '$..td');
        // Logger.debug(`${JSON.stringify(filtered)}`);
      } catch (error) {
        Logger.error(`${error.message}`);
      }
    }
  }
}
