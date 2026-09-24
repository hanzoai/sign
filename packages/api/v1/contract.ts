import type { AppRouter } from '@ts-rest/core';

import {
  ZCreateTemplateV2RequestSchema,
  ZCreateTemplateV2ResponseSchema,
} from '@hanzo/esign-trpc/server/template-router/schema';

import {
  ZAuthorizationHeadersSchema,
  ZCreateDocumentFromTemplateMutationResponseSchema,
  ZCreateDocumentFromTemplateMutationSchema,
  ZCreateDocumentMutationResponseSchema,
  ZCreateDocumentMutationSchema,
  ZCreateFieldMutationSchema,
  ZCreateRecipientMutationSchema,
  ZDeleteDocumentMutationSchema,
  ZDeleteFieldMutationSchema,
  ZDeleteRecipientMutationSchema,
  ZDownloadDocumentQuerySchema,
  ZDownloadDocumentSuccessfulSchema,
  ZGenerateDocumentFromTemplateMutationResponseSchema,
  ZGenerateDocumentFromTemplateMutationSchema,
  ZGetDocumentsQuerySchema,
  ZGetTemplatesQuerySchema,
  ZNoBodyMutationSchema,
  ZResendDocumentForSigningMutationSchema,
  ZSendDocumentForSigningMutationSchema,
  ZSuccessfulDeleteTemplateResponseSchema,
  ZSuccessfulDocumentResponseSchema,
  ZSuccessfulFieldCreationResponseSchema,
  ZSuccessfulFieldResponseSchema,
  ZSuccessfulGetDocumentResponseSchema,
  ZSuccessfulGetTemplateResponseSchema,
  ZSuccessfulGetTemplatesResponseSchema,
  ZSuccessfulRecipientResponseSchema,
  ZSuccessfulResendDocumentResponseSchema,
  ZSuccessfulResponseSchema,
  ZSuccessfulSigningResponseSchema,
  ZUnsuccessfulResponseSchema,
  ZUpdateFieldMutationSchema,
  ZUpdateRecipientMutationSchema,
} from './schema';

const deprecatedDescription =
  'This endpoint is deprecated, but will continue to be supported. For more details, see https://docs.esign.hanzo.ai/developers/public-api.';

// c.router would add the authorization header to every route and narrow each
// route's literals. Its types for adding a header are written against zod 3 —
// AnyZodObject, objectUtil — which zod 4 does not have, so under zod 4 every
// route it returns loses its path, body and responses to an index signature,
// and every handler and client call loses them with it. Each route names the
// header itself, which is what c.router produced at run time, and `as const`
// does the narrowing.
export const ApiContractV1 = {
  getDocuments: {
    method: 'GET',
    path: '/v1/rest/documents',
    headers: ZAuthorizationHeadersSchema,
    query: ZGetDocumentsQuerySchema,
    responses: {
      200: ZSuccessfulResponseSchema,
      401: ZUnsuccessfulResponseSchema,
      404: ZUnsuccessfulResponseSchema,
    },
    summary: 'Get all documents',
    deprecated: true,
    description: deprecatedDescription,
  },

  getDocument: {
    method: 'GET',
    path: '/v1/rest/documents/:id',
    headers: ZAuthorizationHeadersSchema,
    responses: {
      200: ZSuccessfulGetDocumentResponseSchema,
      401: ZUnsuccessfulResponseSchema,
      404: ZUnsuccessfulResponseSchema,
    },
    summary: 'Get a single document',
    deprecated: true,
    description: deprecatedDescription,
  },

  downloadSignedDocument: {
    method: 'GET',
    path: '/v1/rest/documents/:id/download',
    headers: ZAuthorizationHeadersSchema,
    query: ZDownloadDocumentQuerySchema,
    responses: {
      200: ZDownloadDocumentSuccessfulSchema,
      401: ZUnsuccessfulResponseSchema,
      404: ZUnsuccessfulResponseSchema,
    },
    summary: 'Download a signed document when the storage transport is S3',
    deprecated: true,
    description: deprecatedDescription,
  },

  createDocument: {
    method: 'POST',
    path: '/v1/rest/documents',
    headers: ZAuthorizationHeadersSchema,
    body: ZCreateDocumentMutationSchema,
    responses: {
      200: ZCreateDocumentMutationResponseSchema,
      401: ZUnsuccessfulResponseSchema,
      404: ZUnsuccessfulResponseSchema,
    },
    summary: 'Upload a new document and get a presigned URL',
    deprecated: true,
    description: deprecatedDescription,
  },

  createTemplate: {
    method: 'POST',
    path: '/v1/rest/templates',
    headers: ZAuthorizationHeadersSchema,
    body: ZCreateTemplateV2RequestSchema,
    responses: {
      200: ZCreateTemplateV2ResponseSchema,
      401: ZUnsuccessfulResponseSchema,
      404: ZUnsuccessfulResponseSchema,
    },
    summary: 'Create a new template and get a presigned URL',
    deprecated: true,
    description: deprecatedDescription,
  },

  deleteTemplate: {
    method: 'DELETE',
    path: '/v1/rest/templates/:id',
    headers: ZAuthorizationHeadersSchema,
    body: ZNoBodyMutationSchema,
    responses: {
      200: ZSuccessfulDeleteTemplateResponseSchema,
      401: ZUnsuccessfulResponseSchema,
      404: ZUnsuccessfulResponseSchema,
    },
    summary: 'Delete a template',
    deprecated: true,
    description: deprecatedDescription,
  },

  getTemplate: {
    method: 'GET',
    path: '/v1/rest/templates/:id',
    headers: ZAuthorizationHeadersSchema,
    responses: {
      200: ZSuccessfulGetTemplateResponseSchema,
      401: ZUnsuccessfulResponseSchema,
      404: ZUnsuccessfulResponseSchema,
    },
    summary: 'Get a single template',
    deprecated: true,
    description: deprecatedDescription,
  },

  getTemplates: {
    method: 'GET',
    path: '/v1/rest/templates',
    headers: ZAuthorizationHeadersSchema,
    query: ZGetTemplatesQuerySchema,
    responses: {
      200: ZSuccessfulGetTemplatesResponseSchema,
      401: ZUnsuccessfulResponseSchema,
      404: ZUnsuccessfulResponseSchema,
    },
    summary: 'Get all templates',
    deprecated: true,
    description: deprecatedDescription,
  },

  createDocumentFromTemplate: {
    method: 'POST',
    path: '/v1/rest/templates/:templateId/create-document',
    headers: ZAuthorizationHeadersSchema,
    body: ZCreateDocumentFromTemplateMutationSchema,
    responses: {
      200: ZCreateDocumentFromTemplateMutationResponseSchema,
      401: ZUnsuccessfulResponseSchema,
      404: ZUnsuccessfulResponseSchema,
    },
    summary: 'Create a new document from an existing template',
    deprecated: true,
    description: `${deprecatedDescription} \n\nIf you must use the V1 API, use "/v1/rest/templates/:templateId/generate-document" instead.`,
  },

  generateDocumentFromTemplate: {
    method: 'POST',
    path: '/v1/rest/templates/:templateId/generate-document',
    headers: ZAuthorizationHeadersSchema,
    body: ZGenerateDocumentFromTemplateMutationSchema,
    responses: {
      200: ZGenerateDocumentFromTemplateMutationResponseSchema,
      400: ZUnsuccessfulResponseSchema,
      401: ZUnsuccessfulResponseSchema,
      404: ZUnsuccessfulResponseSchema,
      500: ZUnsuccessfulResponseSchema,
    },
    summary: 'Create a new document from an existing template',
    deprecated: true,
    description: `${deprecatedDescription} \n\nCreate a new document from an existing template. Passing in values for title and meta will override the original values defined in the template. If you do not pass in values for recipients, it will use the values defined in the template.`,
  },

  sendDocument: {
    method: 'POST',
    path: '/v1/rest/documents/:id/send',
    headers: ZAuthorizationHeadersSchema,
    body: ZSendDocumentForSigningMutationSchema,
    responses: {
      200: ZSuccessfulSigningResponseSchema,
      400: ZUnsuccessfulResponseSchema,
      401: ZUnsuccessfulResponseSchema,
      404: ZUnsuccessfulResponseSchema,
      500: ZUnsuccessfulResponseSchema,
    },
    summary: 'Send a document for signing',
    deprecated: true,
    description: `${deprecatedDescription} \n\nNotes\n\nsendEmail - Whether to send an email to the recipients asking them to action the document. If you disable this, you will need to manually distribute the document to the recipients using the generated signing links. Defaults to true`,
  },

  resendDocument: {
    method: 'POST',
    path: '/v1/rest/documents/:id/resend',
    headers: ZAuthorizationHeadersSchema,
    body: ZResendDocumentForSigningMutationSchema,
    responses: {
      200: ZSuccessfulResendDocumentResponseSchema,
      400: ZUnsuccessfulResponseSchema,
      401: ZUnsuccessfulResponseSchema,
      404: ZUnsuccessfulResponseSchema,
      500: ZUnsuccessfulResponseSchema,
    },
    summary: 'Re-send a document for signing',
    deprecated: true,
    description: deprecatedDescription,
  },

  deleteDocument: {
    method: 'DELETE',
    path: '/v1/rest/documents/:id',
    headers: ZAuthorizationHeadersSchema,
    body: ZDeleteDocumentMutationSchema,
    responses: {
      200: ZSuccessfulDocumentResponseSchema,
      401: ZUnsuccessfulResponseSchema,
      404: ZUnsuccessfulResponseSchema,
    },
    summary: 'Delete a document',
    deprecated: true,
    description: deprecatedDescription,
  },

  createRecipient: {
    method: 'POST',
    path: '/v1/rest/documents/:id/recipients',
    headers: ZAuthorizationHeadersSchema,
    body: ZCreateRecipientMutationSchema,
    responses: {
      200: ZSuccessfulRecipientResponseSchema,
      400: ZUnsuccessfulResponseSchema,
      401: ZUnsuccessfulResponseSchema,
      404: ZUnsuccessfulResponseSchema,
      500: ZUnsuccessfulResponseSchema,
    },
    summary: 'Create a recipient for a document',
    deprecated: true,
    description: deprecatedDescription,
  },

  updateRecipient: {
    method: 'PATCH',
    path: '/v1/rest/documents/:id/recipients/:recipientId',
    headers: ZAuthorizationHeadersSchema,
    body: ZUpdateRecipientMutationSchema,
    responses: {
      200: ZSuccessfulRecipientResponseSchema,
      400: ZUnsuccessfulResponseSchema,
      401: ZUnsuccessfulResponseSchema,
      404: ZUnsuccessfulResponseSchema,
      500: ZUnsuccessfulResponseSchema,
    },
    summary: 'Update a recipient for a document',
    deprecated: true,
    description: deprecatedDescription,
  },

  deleteRecipient: {
    method: 'DELETE',
    path: '/v1/rest/documents/:id/recipients/:recipientId',
    headers: ZAuthorizationHeadersSchema,
    body: ZDeleteRecipientMutationSchema,
    responses: {
      200: ZSuccessfulRecipientResponseSchema,
      400: ZUnsuccessfulResponseSchema,
      401: ZUnsuccessfulResponseSchema,
      404: ZUnsuccessfulResponseSchema,
      500: ZUnsuccessfulResponseSchema,
    },
    summary: 'Delete a recipient from a document',
    deprecated: true,
    description: deprecatedDescription,
  },

  createField: {
    method: 'POST',
    path: '/v1/rest/documents/:id/fields',
    headers: ZAuthorizationHeadersSchema,
    body: ZCreateFieldMutationSchema,
    responses: {
      200: ZSuccessfulFieldCreationResponseSchema,
      400: ZUnsuccessfulResponseSchema,
      401: ZUnsuccessfulResponseSchema,
      404: ZUnsuccessfulResponseSchema,
      500: ZUnsuccessfulResponseSchema,
    },
    summary: 'Create a field for a document',
    deprecated: true,
    description: deprecatedDescription,
  },

  updateField: {
    method: 'PATCH',
    path: '/v1/rest/documents/:id/fields/:fieldId',
    headers: ZAuthorizationHeadersSchema,
    body: ZUpdateFieldMutationSchema,
    responses: {
      200: ZSuccessfulFieldResponseSchema,
      400: ZUnsuccessfulResponseSchema,
      401: ZUnsuccessfulResponseSchema,
      404: ZUnsuccessfulResponseSchema,
      500: ZUnsuccessfulResponseSchema,
    },
    summary: 'Update a field for a document',
    deprecated: true,
    description: deprecatedDescription,
  },

  deleteField: {
    method: 'DELETE',
    path: '/v1/rest/documents/:id/fields/:fieldId',
    headers: ZAuthorizationHeadersSchema,
    body: ZDeleteFieldMutationSchema,
    responses: {
      200: ZSuccessfulFieldResponseSchema,
      400: ZUnsuccessfulResponseSchema,
      401: ZUnsuccessfulResponseSchema,
      404: ZUnsuccessfulResponseSchema,
      500: ZUnsuccessfulResponseSchema,
    },
    summary: 'Delete a field from a document',
    deprecated: true,
    description: deprecatedDescription,
  },
} as const satisfies AppRouter;
