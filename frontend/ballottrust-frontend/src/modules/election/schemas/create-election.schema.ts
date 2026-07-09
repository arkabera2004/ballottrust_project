import { z } from 'zod';

import {
  ElectionType,
  ResultVisibility,
} from '../types';

export const createElectionSchema = z
  .object({
    title: z
      .string()
      .trim()
      .min(5)
      .max(150),

    description: z
      .string()
      .max(1000)
      .optional(),

    electionType: z.enum(
      Object.values(ElectionType) as [
        string,
        ...string[],
      ],
    ),

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

    startDate: z.string(),

    endDate: z.string(),

    candidateLimit: z
      .number()
      .min(1),

    maximumVotes: z
      .number()
      .min(1),

    allowRevote:
      z.boolean(),

    blockchainEnabled:
      z.boolean(),

    auditEnabled:
      z.boolean(),

    autoPublish:
      z.boolean(),

    autoArchive:
      z.boolean(),

    resultVisibility: z.enum(
      Object.values(ResultVisibility) as [
        string,
        ...string[],
      ],
    ),
  })

  .refine(
    (data) =>
      new Date(data.endDate) >
      new Date(data.startDate),
    {
      path: ['endDate'],
      message:
        'End date must be after start date.',
    },
  );

export type CreateElectionForm =
  z.infer<
    typeof createElectionSchema
  >;