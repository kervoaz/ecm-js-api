/**
 * compress a string
 * @param input
 */
import * as zlib from 'zlib';
import fs from 'fs';
import { Readable } from 'stream';
import { ECMiDocument } from '../storage/storage.model';

export function zip(input: string): Buffer {
  return zlib.deflateSync(Buffer.from(input, 'utf8'));
}

/**
 * unzip a buffer to a string
 * @param input
 */
export function unzip(input: Buffer): Buffer {
  return zlib.inflateSync(input);
}

export function chunck<R>(input: Array<R>, chunkSize: number): Array<Array<R>> {
  const ret = [];
  for (let i = 0; i < input.length; i += chunkSize) {
    ret.push(input.slice(i, i + chunkSize));
  }
  return ret;
}
export function fileNameToString(fileName: string) {
  const curDir = 'C:/Users/ho.ckervoazou/dev_perso/ecm-js-api/test'; //__dirname.substr(0, __dirname.lastIndexOf('\\test'));
  const rawdata = fs.readFileSync(`${curDir}/test/resources/${fileName}`);
  return Buffer.from(rawdata).toString('utf8');
}

export function fileToFormData(fileContent: Buffer): Readable {
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  const FormDataNotTS = require('form-data');
  const formData = new FormDataNotTS();
  const inStream = new Readable({
    read() {},
  });
  inStream.push(fileContent);
  inStream.push(null);
  formData.append('file', inStream, 'fd.value');
  return formData;
}

// eslint-disable-next-line @typescript-eslint/no-var-requires
const parser = require('fast-xml-parser');
// eslint-disable-next-line @typescript-eslint/no-var-requires
const he = require('he');
// eslint-disable-next-line @typescript-eslint/no-var-requires
const jp = require('jsonpath');

export function xml2Json(xml: string): any {
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
  const jsonObj = parser.parse(
    xml,
    options,
    true,
  );
  return jsonObj;
}

export function replacer(key, value) {
  if(value instanceof Map) {
    return {
      dataType: 'Map',
      value: Array.from(value.entries()), // or with spread: value: [...value]
    };
  } else {
    return value;
  }
}
export function reviver(key, value) {
  if(typeof value === 'object' && value !== null) {
    if (value.dataType === 'Map') {
      return new Map(value.value);
    }
  }
  return value;
}
