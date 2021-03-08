export const BLSchema = {
  $schema: 'http://json-schema.org/draft-07/schema#',
  $id: 'http://example.com/BL.schema.json',
  title: 'BillOfLading',
  description: 'BL',
  type: 'object',
  properties: {
    dDocType: {
      description: 'Type of document',
      const: 'BL',
    },
    xNATUR: {
      description: 'The nature of BL',
      type: 'string',
    },
    xBLNUM: {
      description: 'BL number',
      type: 'string',
    },
    xFRTBL: {
      description: 'Freight or not',
      type: 'string',
    },
  },
  required: ['xBLNUM', 'xNATUR', 'xFRTBL'],
};
