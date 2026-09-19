-- CreateEnum
CREATE TYPE "ManifestoStatus" AS ENUM ('DRAFT', 'SUBMITTED', 'APPROVED', 'REJECTED');

-- CreateTable
CREATE TABLE "CandidateManifesto" (
    "id" TEXT NOT NULL,
    "candidateId" TEXT NOT NULL,
    "version" INTEGER NOT NULL,
    "title" TEXT NOT NULL,
    "summary" TEXT,
    "content" TEXT NOT NULL,
    "documentUrl" TEXT,
    "videoUrl" TEXT,
    "coverImage" TEXT,
    "status" "ManifestoStatus" NOT NULL DEFAULT 'DRAFT',
    "submittedAt" TIMESTAMP(3),
    "approvedById" TEXT,
    "approvedAt" TIMESTAMP(3),
    "rejectedById" TEXT,
    "rejectedAt" TIMESTAMP(3),
    "rejectionReason" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "CandidateManifesto_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "CandidateManifesto_candidateId_status_idx" ON "CandidateManifesto"("candidateId", "status");

-- CreateIndex
CREATE INDEX "CandidateManifesto_status_idx" ON "CandidateManifesto"("status");

-- CreateIndex
CREATE UNIQUE INDEX "CandidateManifesto_candidateId_version_key" ON "CandidateManifesto"("candidateId", "version");

-- AddForeignKey
ALTER TABLE "CandidateManifesto" ADD CONSTRAINT "CandidateManifesto_candidateId_fkey" FOREIGN KEY ("candidateId") REFERENCES "Candidate"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CandidateManifesto" ADD CONSTRAINT "CandidateManifesto_approvedById_fkey" FOREIGN KEY ("approvedById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CandidateManifesto" ADD CONSTRAINT "CandidateManifesto_rejectedById_fkey" FOREIGN KEY ("rejectedById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
