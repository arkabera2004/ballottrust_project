import { Injectable } from '@nestjs/common';

// ======================================================
// Candidate Profile Input
// ======================================================

export interface CandidateProfileData {
  position: string | null;
  biography: string | null;
  campaignSlogan: string | null;
  manifesto: string | null;
  agenda: string | null;
  achievements: string | null;
  nominationStatement: string | null;
  photoUrl: string | null;
}

// ======================================================
// Candidate Profile Completeness Result
// ======================================================

export interface CandidateProfileCompletenessResult {
  complete: boolean;
  completionPercentage: number;
  completedFields: number;
  totalFields: number;
  missingFields: (keyof CandidateProfileData)[];
}

@Injectable()
export class CandidateProfileCompletenessService {
  // ======================================================
  // Required Profile Fields
  // ======================================================

  private readonly requiredFields:
    (keyof CandidateProfileData)[] = [
      'position',
      'biography',
      'campaignSlogan',
      'manifesto',
      'agenda',
      'achievements',
      'nominationStatement',
      'photoUrl',
    ];

  // ======================================================
  // Calculate Profile Completeness
  // ======================================================

  calculate(
    candidate: CandidateProfileData,
  ): CandidateProfileCompletenessResult {
    const missingFields =
      this.requiredFields.filter(
        (field) =>
          !this.hasValue(
            candidate[field],
          ),
      );

    const totalFields =
      this.requiredFields.length;

    const completedFields =
      totalFields -
      missingFields.length;

    const completionPercentage =
      Math.round(
        (completedFields /
          totalFields) *
          100,
      );

    return {
      complete:
        missingFields.length === 0,

      completionPercentage,

      completedFields,

      totalFields,

      missingFields,
    };
  }

  // ======================================================
  // Value Check
  // ======================================================

  private hasValue(
    value: string | null | undefined,
  ): boolean {
    return (
      typeof value === 'string' &&
      value.trim().length > 0
    );
  }
}