import { Controller, Get, Param } from '@nestjs/common';
import { DashboardService } from './dashboard.service';

@Controller('dashboard')
export class DashboardController {
  constructor(private dashboardService: DashboardService) {}

  @Get('stats')
  getStats() {
    return this.dashboardService.getStats();
  }

  @Get('winner')
  getWinnerSummary() {
    return this.dashboardService.getWinnerSummary();
  }

  @Get('results-chart/:electionId')
  getResultsChart(@Param('electionId') electionId: string) {
    return this.dashboardService.getResultsChart(electionId);
  }

  @Get('current-election')
  getCurrentElection() {
    return this.dashboardService.getCurrentElection();
  }
}
