import { BadRequestException, Injectable } from '@nestjs/common';

@Injectable()
export class CampaignWindowValidator {
  // ==========================================
  // Validate Campaign Window
  // ==========================================

  validate(
    campaignStart: Date | null,
    campaignEnd: Date | null,
    currentDate: Date = new Date(),
  ): void {
    // ========================================
    // 1. Campaign Schedule Must Exist
    // ========================================

    if (!campaignStart || !campaignEnd) {
      throw new BadRequestException(
        'Campaign period has not been configured for this election.',
      );
    }

    // ========================================
    // 2. Validate Campaign Configuration
    // ========================================

    if (campaignStart.getTime() >= campaignEnd.getTime()) {
      throw new BadRequestException('The election campaign period is invalid.');
    }

    // ========================================
    // 3. Campaign Has Not Started
    // ========================================

    if (currentDate.getTime() < campaignStart.getTime()) {
      throw new BadRequestException('The campaign period has not started yet.');
    }

    // ========================================
    // 4. Campaign Has Ended
    // ========================================

    if (currentDate.getTime() > campaignEnd.getTime()) {
      throw new BadRequestException('The campaign period has ended.');
    }
  }

  // ==========================================
  // Check Whether Campaign Is Open
  // ==========================================

  isOpen(
    campaignStart: Date | null,
    campaignEnd: Date | null,
    currentDate: Date = new Date(),
  ): boolean {
    if (!campaignStart || !campaignEnd) {
      return false;
    }

    if (campaignStart.getTime() >= campaignEnd.getTime()) {
      return false;
    }

    return (
      currentDate.getTime() >= campaignStart.getTime() &&
      currentDate.getTime() <= campaignEnd.getTime()
    );
  }

  // ==========================================
  // Get Campaign Status
  // ==========================================

  getStatus(
    campaignStart: Date | null,
    campaignEnd: Date | null,
    currentDate: Date = new Date(),
  ): 'NOT_CONFIGURED' | 'NOT_STARTED' | 'ACTIVE' | 'ENDED' {
    if (!campaignStart || !campaignEnd) {
      return 'NOT_CONFIGURED';
    }

    if (currentDate.getTime() < campaignStart.getTime()) {
      return 'NOT_STARTED';
    }

    if (currentDate.getTime() > campaignEnd.getTime()) {
      return 'ENDED';
    }

    return 'ACTIVE';
  }
}
