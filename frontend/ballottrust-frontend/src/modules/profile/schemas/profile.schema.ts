import { z } from 'zod';

export const profileSchema = z.object({

  fullName: z
    .string()
    .min(3, 'Full name must contain at least 3 characters'),

  phoneNumber: z.string().optional(),

  bio: z.string().optional(),

  department: z.string().optional(),

  course: z.string().optional(),

 year: z
  .number()
  .optional()
  .nullable(),

semester: z
  .number()
  .optional()
  .nullable(),

  registrationNumber: z.string().optional(),

  address: z.string().optional(),

  city: z.string().optional(),

  state: z.string().optional(),

  country: z.string().optional(),

  postalCode: z.string().optional(),

});

export type ProfileFormData =
  z.infer<typeof profileSchema>;