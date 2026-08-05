-- CreateEnum
CREATE TYPE "CandidateDocumentType" AS ENUM ('IDENTITY_PROOF', 'STUDENT_ID', 'ELIGIBILITY_PROOF', 'NOMINATION_FORM', 'SUPPORTING_DOCUMENT', 'OTHER');

-- CreateEnum
CREATE TYPE "CandidateDocumentStatus" AS ENUM ('PENDING', 'VERIFIED', 'REJECTED');

-- CreateTable
CREATE TABLE "CandidateDocument" (
    "id" TEXT NOT NULL,
    "candidateId" TEXT NOT NULL,
    "documentType" "CandidateDocumentType" NOT NULL,
    "originalFileName" TEXT NOT NULL,
    "fileUrl" TEXT NOT NULL,
    "mimeType" TEXT NOT NULL,
    "fileSize" INTEGER NOT NULL,
    "status" "CandidateDocumentStatus" NOT NULL DEFAULT 'PENDING',
    "verifiedById" TEXT,
    "verifiedAt" TIMESTAMP(3),
    "rejectedById" TEXT,
    "rejectedAt" TIMESTAMP(3),
    "rejectionReason" TEXT,
    "replacedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "CandidateDocument_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "CandidateDocument_candidateId_idx" ON "CandidateDocument"("candidateId");

-- CreateIndex
CREATE INDEX "CandidateDocument_documentType_idx" ON "CandidateDocument"("documentType");

-- CreateIndex
CREATE INDEX "CandidateDocument_status_idx" ON "CandidateDocument"("status");

-- CreateIndex
CREATE INDEX "CandidateDocument_verifiedById_idx" ON "CandidateDocument"("verifiedById");

-- CreateIndex
CREATE INDEX "CandidateDocument_rejectedById_idx" ON "CandidateDocument"("rejectedById");

-- CreateIndex
CREATE INDEX "CandidateDocument_candidateId_status_idx" ON "CandidateDocument"("candidateId", "status");

-- AddForeignKey
ALTER TABLE "CandidateDocument" ADD CONSTRAINT "CandidateDocument_candidateId_fkey" FOREIGN KEY ("candidateId") REFERENCES "Candidate"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CandidateDocument" ADD CONSTRAINT "CandidateDocument_verifiedById_fkey" FOREIGN KEY ("verifiedById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CandidateDocument" ADD CONSTRAINT "CandidateDocument_rejectedById_fkey" FOREIGN KEY ("rejectedById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
