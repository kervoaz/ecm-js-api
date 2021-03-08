export const OtherSchema = {
  $schema: 'http://json-schema.org/draft-07/schema#',
  $id: 'http://example.com/BL.schema.json',
  title: 'Other document',
  description: 'Other',
  type: 'object',
  properties: {
    dDocType: {
      description: 'Type of document',
      const: 'OTHER',
    },
  },
  required: ['dDocType'],
};
