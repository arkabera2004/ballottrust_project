import { z } from 'zod';

export const createCandidateSchema = z.object({
  electionId: z
    .string()
    .uuid('Please select an election.'),

  candidateType: z.enum([
    'INDEPENDENT',
    'PARTY',
  ]),

  partyId: z
    .string()
    .uuid()
    .optional()
    .or(z.literal('')),

  position: z
    .string()
    .trim()
    .min(2, 'Position must be at least 2 characters.')
    .max(100, 'Position cannot exceed 100 characters.'),

  biography: z
    .string()
    .max(2000, 'Biography cannot exceed 2000 characters.')
    .optional(),

  campaignSlogan: z
    .string()
    .max(200, 'Campaign slogan cannot exceed 200 characters.')
    .optional(),

  campaignWebsite: z
    .string()
    .url('Enter a valid website URL.')
    .optional()
    .or(z.literal('')),

  manifesto: z
    .string()
    .max(5000, 'Manifesto cannot exceed 5000 characters.')
    .optional(),

  agenda: z
    .string()
    .max(5000, 'Agenda cannot exceed 5000 characters.')
    .optional(),

  achievements: z
    .string()
    .max(5000, 'Achievements cannot exceed 5000 characters.')
    .optional(),

  nominationStatement: z
    .string()
    .trim()
    .min(
      20,
      'Nomination statement must be at least 20 characters.',
    )
    .max(
      5000,
      'Nomination statement cannot exceed 5000 characters.',
    ),

  photoUrl: z
    .string()
    .url('Enter a valid photo URL.')
    .optional()
    .or(z.literal('')),

  documentUrl: z
    .string()
    .url('Enter a valid document URL.')
    .optional()
    .or(z.literal('')),
});

export type CreateCandidateForm = z.infer<
  typeof createCandidateSchema
>;
