import { z } from 'zod';

/**
 * Required/validated subset of process.env. Passed to ConfigModule.forRoot's
 * `validate` option so a missing or malformed value fails fast at startup
 * instead of surfacing later as an obscure runtime error (e.g. Prisma
 * connecting to `undefined`, or the Google strategy throwing on boot).
 * `.passthrough()` lets unrelated env vars (PATH, CI, etc.) through
 * unvalidated — this only constrains variables the app actually reads.
 */
export const envSchema = z
  .object({
    DATABASE_URL: z.string().min(1, 'DATABASE_URL is required'),
    JWT_SECRET: z.string().min(1, 'JWT_SECRET is required'),

    GOOGLE_CLIENT_ID: z.string().min(1, 'GOOGLE_CLIENT_ID is required'),
    GOOGLE_CLIENT_SECRET: z.string().min(1, 'GOOGLE_CLIENT_SECRET is required'),
    GOOGLE_CALLBACK_URL: z.string().min(1, 'GOOGLE_CALLBACK_URL is required'),

    MAIL_HOST: z.string().min(1, 'MAIL_HOST is required'),
    MAIL_PORT: z
      .string()
      .min(1, 'MAIL_PORT is required')
      .refine((value) => !Number.isNaN(Number(value)), {
        message: 'MAIL_PORT must be numeric',
      }),
    MAIL_FROM: z.string().min(1, 'MAIL_FROM is required'),
    MAIL_USER: z.string().optional(),
    MAIL_PASSWORD: z.string().optional(),

    PORT: z
      .string()
      .optional()
      .refine((value) => value === undefined || !Number.isNaN(Number(value)), {
        message: 'PORT must be numeric',
      }),
    NODE_ENV: z.string().optional(),
    FRONTEND_URL: z.string().optional(),
    CORS_ORIGINS: z.string().optional(),

    // Express `trust proxy` setting (docs/11_Deployment_Guide.md §2). Controls which
    // X-Forwarded-For hop the rate limiter (BT-SEC-001) and req.ip trust. Left optional
    // and defaulting to `false` in main.ts: an unconfigured deployment must not blindly
    // trust client-supplied forwarding headers. Set explicitly once the real hosting
    // topology (number of reverse-proxy hops) is known.
    TRUST_PROXY: z.string().optional(),

    BOOTSTRAP_ADMIN_TOKEN: z.string().optional(),
    BOOTSTRAP_ADMIN_EMAIL: z.string().optional(),
    BOOTSTRAP_ADMIN_PASSWORD: z.string().optional(),
  })
  .passthrough();

export function validateEnv(
  config: Record<string, unknown>,
): Record<string, unknown> {
  const result = envSchema.safeParse(config);

  if (!result.success) {
    const issues = result.error.issues
      .map((issue) => `  - ${issue.path.join('.')}: ${issue.message}`)
      .join('\n');

    throw new Error(`Invalid environment configuration:\n${issues}`);
  }

  return result.data;
}
