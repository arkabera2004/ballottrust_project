-- AlterTable
ALTER TABLE "public"."User" ADD COLUMN     "emailVerificationOtp" TEXT,
ADD COLUMN     "emailVerificationOtpExpiresAt" TIMESTAMP(3),
ADD COLUMN     "passwordResetToken" TEXT,
ADD COLUMN     "passwordResetTokenExpiresAt" TIMESTAMP(3);
