import { z } from 'zod';

export const registerSchema = z.object({

  fullName: z

    .string()

    .min(3, 'Full name is required'),

  email: z

    .string()

    .email('Invalid email'),

  password: z

    .string()

    .min(8, 'Minimum 8 characters'),

  role: z.enum([
    'VOTER',
    'CANDIDATE',
  ]),

});

export type RegisterFormData =
  z.infer<typeof registerSchema>;