import * as DocumentRepository from './dao/document.dao';
import * as MetadataRepository from './dao/metadata.dao';
import { ECMFile } from './storage.model';

export async function upload(eFile: ECMFile) {
  await DocumentRepository.save(eFile);
  await MetadataRepository.save(eFile);
}
