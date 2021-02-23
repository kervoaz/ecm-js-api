/**
 * compress a string
 * @param input
 */
import * as zlib from 'zlib';

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
