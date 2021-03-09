import { Injectable, Logger } from '@nestjs/common';
import { PDFDocument } from 'pdf-lib';
import {
  ECMiDocument,
  FunctionalType,
  Metadata,
  Origin,
} from '../storage/storage.model';
import { ContentAnalyzerService } from './content-analyzer.service';
import { replacer } from '../technical/Utils';

@Injectable()
export class AnalyzerPDFService {
  constructor(private readonly parserService: ContentAnalyzerService) {}
  async analyze(document: ECMiDocument) {
    // Load a PDFDocument without updating its existing metadata
    const pdfDoc = await PDFDocument.load(document.fileContent.content, {
      updateMetadata: false,
    });
    if (document.origin === Origin.LARA) {
      document.addMetadata(parseMeta4Lara(pdfDoc.getTitle()));
      document.addMetadata(parseMeta4Lara(pdfDoc.getAuthor()));
      document.addMetadata(parseMeta4Lara(pdfDoc.getSubject()));
      document.addMetadata(parseMeta4Lara(pdfDoc.getKeywords()));
      console.log('Producer:', pdfDoc.getProducer());
      console.log('Creation Date:', pdfDoc.getCreationDate());
      console.log('Modification Date:', pdfDoc.getModificationDate());
      console.log('nb pages', pdfDoc.getPageCount());
      document.asJson();
      const outlines: { li: Array<string> } =
        document.documentAnalyzis.parsed['html']['body']['ul'];
      let bookmarks;
      if (!(outlines['li'] instanceof Array)) {
        bookmarks = [outlines['li']];
      } else {
        bookmarks = outlines['li'];
      }
      if (bookmarks.length > 1) {
        throw new Error(
          `This file is a multi document. Split on bookmark/outline not yet implemented`,
        );
      }
      for (const bookmark of bookmarks) {
        const meta = parseMeta4Lara(bookmark);
        document.addMetadata(meta);
        Logger.debug(JSON.stringify(meta, replacer));
      }
    } else {
      Logger.debug(`no additional metadata will be discovered from file`);
      document.addMetadata({ dDocType: FunctionalType.OTHER });
    }
  }
}

function parseMeta4Lara(laraMeta: string): Metadata {
  const metaMap = {};
  if (laraMeta) {
    const metas = laraMeta.split('|');
    for (const meta of metas) {
      const kv = meta.split('=');
      if (kv[1] === '""') {
        //skip TODO correct?
      } else if (kv[1] === undefined) {
        metaMap['functionalKey'] = kv[0];
      } else {
        metaMap[kv[0]] = kv[1].replace(/"/g, '');
      }
    }
  }
  return metaMap;
}
