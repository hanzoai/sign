import { initClient } from '@ts-rest/core';

import { ApiContractV1 } from '../contract';

const main = async () => {
  const client = initClient(ApiContractV1, {
    baseUrl: 'http://localhost:3000/api/v1',
    baseHeaders: {
      authorization: 'Bearer <my-token>',
    },
  });

  const documentId = '1';
  const recipientId = 1;

  const { status, body } = await client.createField({
    params: {
      id: documentId,
    },
    body: {
      type: 'SIGNATURE',
      pageHeight: 2.5, // percent of page to occupy in height
      pageWidth: 5, // percent of page to occupy in width
      pageX: 10, // percent from left
      pageY: 10, // percent from top
      pageNumber: 1,
      recipientId,
    },
  });

  if (status !== 200) {
    throw new Error('Failed to create field');
  }

  // One field in, one field out, but the response names a list or a single field.
  const [field] = Array.isArray(body.fields) ? body.fields : [body.fields];

  console.log(`Field created with id: ${field.id}`);
};

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
