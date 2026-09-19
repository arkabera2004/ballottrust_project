import { Injectable } from '@nestjs/common';
import { ElectionType } from '@prisma/client';

@Injectable()
export class ElectionCodeGenerator {
  generate(
    electionType: ElectionType,
    sequence: number,
    date: Date = new Date(),
  ): string {
    const year = date.getFullYear();

    const type = this.getElectionPrefix(electionType);

    const serial = sequence.toString().padStart(6, '0');

    return `BT-${year}-${type}-${serial}`;
  }

  private getElectionPrefix(type: ElectionType): string {
    switch (type) {
      case ElectionType.STUDENT_COUNCIL:
        return 'SC';

      case ElectionType.CLUB:
        return 'CLB';

      case ElectionType.UNIVERSITY:
        return 'UNI';

      case ElectionType.CORPORATE:
        return 'COR';

      case ElectionType.GOVERNMENT:
        return 'GOV';

      case ElectionType.CUSTOM:
        return 'CST';

      default:
        return 'ELE';
    }
  }
}
