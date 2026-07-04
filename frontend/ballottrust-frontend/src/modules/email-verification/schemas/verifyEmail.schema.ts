import { z } from 'zod';

export const verifyEmailSchema = z.object({

  email: z
    .string()
    .email('Invalid email address'),

  otp: z
    .string()
    .length(6, 'OTP must be 6 digits')
    .regex(/^\d+$/, 'OTP must contain only numbers'),

});

export type VerifyEmailFormData =
  z.infer<typeof verifyEmailSchema>;