import { HttpService, Injectable } from '@nestjs/common';
import { AxiosRequestConfig, AxiosResponse } from 'axios';
import { ECMiDocument } from '../storage/storage.model';
// eslint-disable-next-line @typescript-eslint/no-var-requires
const FormDataNotTS = require('form-data');
// eslint-disable-next-line @typescript-eslint/no-var-requires
const Readable = require('stream').Readable;

@Injectable()
export class ContentAnalyzerService {
  constructor(private httpService: HttpService) {}

  async extract(document: ECMiDocument): Promise<AxiosResponse> {
    const formData = new FormDataNotTS();
    formData.append('file', bufferToStream(document.fileContent.content));
    const config: AxiosRequestConfig = {
      method: 'POST',
      url: process.env.TIKA_URL
        ? process.env.TIKA_URL
        : 'http://localhost:9999/tika/form',
      headers: {
        Accept: 'text/xml',
        ...formData.getHeaders(),
      },
      data: formData,
    };
    return this.httpService.request(config).toPromise();
  }
}

function bufferToStream(buffer) {
  const stream = new Readable();
  stream.push(buffer);
  stream.push(null);
  return stream;
}
