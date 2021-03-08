export const InvoiceSchema = {
  $schema: 'http://json-schema.org/draft-07/schema#',
  $id: 'http://example.com/Invoice.schema.json',
  title: 'Invoice',
  description: 'Invoice',
  type: 'object',
  properties: {
    dDocType: {
      description: 'Type of document',
      const: 'INVOICE',
    },
    xNATUR: {
      description: 'invoice nature',
      type: 'string',
    },
    xRPNAM: {
      description: 'report',
      type: 'string',
    },
    xINVNB: {
      description: 'invoice number',
      type: 'string',
    },
  },
  required: ['xNATUR', 'xINVNB'],
};
