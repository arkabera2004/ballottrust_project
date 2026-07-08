import { Controller, Get } from '@nestjs/common';

@Controller()
export class AppController {

  @Get()
  healthCheck() {
    return {
      application: 'BallotTrust',
      version: '1.0.0',
      status: 'Running Successfully',
    };
  }

}