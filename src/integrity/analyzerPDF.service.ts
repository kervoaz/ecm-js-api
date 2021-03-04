import { Injectable, Logger } from '@nestjs/common';
import { PDFDocument } from 'pdf-lib';
import { Document, ECMiDocument, Metadata } from '../storage/storage.model';
import { ParserService } from './parser.service';
import { replacer } from '../technical/Utils';

@Injectable()
export class AnalyzerPDFService {
  constructor(private readonly parserService: ParserService) {}
  async analyze(document: ECMiDocument) {
    // Load a PDFDocument without updating its existing metadata
    const pdfDoc = await PDFDocument.load(document.fileContent.content, {
      updateMetadata: false,
    });
    // Print all available metadata fields
    console.log('Title:', pdfDoc.getTitle());
    console.log('Author:', pdfDoc.getAuthor());
    console.log('Subject:', pdfDoc.getSubject());
    console.log('Creator:', pdfDoc.getCreator());
    console.log('Keywords:', pdfDoc.getKeywords());
    console.log('Producer:', pdfDoc.getProducer());
    console.log('Creation Date:', pdfDoc.getCreationDate());
    console.log('Modification Date:', pdfDoc.getModificationDate());
    console.log('nb pages', pdfDoc.getPageCount());
    document.asJson();
    const bookmarks: { li: Array<string> } =
      document.documentAnalyzis.parsed['html']['body']['ul'];
    if (bookmarks.li.length > 1) {
      throw new Error(`Split on bookmark/outline not yet implemented`);
    }
    for (const bookmark of bookmarks.li) {
      const meta = parseLaraPdfBookmark(bookmark);
      document.metadata = meta;
      Logger.debug(JSON.stringify(meta, replacer));
    }
  }
}

function parseLaraPdfBookmark(laraBookmark: string): Metadata {
  const metaMap = new Map<string, string>();
  if (!laraBookmark) {
    throw new Error(`Lara document MUST have bookmarks`);
  }
  const metas = laraBookmark.split('|');
  for (const meta of metas) {
    const kv = meta.split('=');
    if (kv[1] === '""') {
      //skip TODO correct?
    } else if (kv[1] === undefined) {
      metaMap.set('functionalKey', kv[0]);
    } else {
      metaMap.set(kv[0], kv[1]);
    }
  }

  return metaMap;
}
