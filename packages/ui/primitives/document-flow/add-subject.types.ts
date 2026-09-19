import { DocumentDistributionMethod } from '@prisma/client';
import { z } from 'zod';

import { ZDocumentEmailSettingsSchema } from '@hanzo/esign-lib/types/document-email';

export const ZAddSubjectFormSchema = z.object({
  meta: z.object({
    emailId: z.string().nullable(),
    emailReplyTo: z.preprocess(
      (val: string | undefined) => (val === '' ? undefined : val),
      z.string().email().optional(),
    ),
    // emailReplyName: z.string().optional(),
    subject: z.string(),
    message: z.string(),
    distributionMethod: z
      .nativeEnum(DocumentDistributionMethod)
      .optional()
      .default(DocumentDistributionMethod.EMAIL),
    emailSettings: ZDocumentEmailSettingsSchema,
  }),
});

export type TAddSubjectFormSchema = z.infer<typeof ZAddSubjectFormSchema>;

// What the form holds, before the schema fills in its defaults.
export type TAddSubjectFormInput = z.input<typeof ZAddSubjectFormSchema>;
