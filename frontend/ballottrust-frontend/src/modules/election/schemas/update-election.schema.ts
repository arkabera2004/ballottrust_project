import { z } from 'zod';

import {
  ElectionType,
  ResultVisibility,
} from '../types';

export const updateElectionSchema = z.object({
  title: z
    .string()
    .trim()
    .min(5)
    .max(150)
    .optional(),

  description: z
    .string()
    .max(1000)
    .optional(),

  electionType: z
    .enum(
      Object.values(ElectionType) as [
        string,
        ...string[],
      ],
    )
    .optional(),

  registrationStart:
    z.string().optional(),

  registrationEnd:
    z.string().optional(),

  nominationStart:
    z.string().optional(),

  nominationEnd:
    z.string().optional(),

  campaignStart:
    z.string().optional(),

  campaignEnd:
    z.string().optional(),

  startDate:
    z.string().optional(),

  endDate:
    z.string().optional(),

  candidateLimit: z
    .number()
    .min(1)
    .optional(),

  maximumVotes: z
    .number()
    .min(1)
    .optional(),

  allowRevote:
    z.boolean().optional(),

  blockchainEnabled:
    z.boolean().optional(),

  auditEnabled:
    z.boolean().optional(),

  autoPublish:
    z.boolean().optional(),

  autoArchive:
    z.boolean().optional(),

  resultVisibility: z
    .enum(
      Object.values(ResultVisibility) as [
        string,
        ...string[],
      ],
    )
    .optional(),
})
.superRefine((data, ctx) => {
  if (
    data.startDate &&
    data.endDate &&
    new Date(data.endDate) <=
      new Date(data.startDate)
  ) {
    ctx.addIssue({
      code: 'custom',
      path: ['endDate'],
      message:
        'End date must be after start date.',
    });
  }
});

export type UpdateElectionForm =
  z.infer<typeof updateElectionSchema>;