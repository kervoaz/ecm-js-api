import { PDFDocument } from 'pdf-lib';
import { Injectable, Logger } from '@nestjs/common';
import { Document } from '../storage/storage.model';

@Injectable()
export class AnalyzerService {
  // Load a PDFDocument without updating its existing metadata
  async analyzePdf(document: Document) {
    if (document.fileContent.mimeType.includes('pdf')) {
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
    } else {
      Logger.warn(`anlyze impossible`);
    }
  }
}
