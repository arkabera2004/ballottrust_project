import { Body, Controller, Post } from '@nestjs/common';
import { MailService } from './mail.service';

@Controller('mail')
export class MailController {
  constructor(
    private readonly mailService: MailService,
  ) {}

  @Post('test')
  async send(
    @Body('email') email: string,
  ) {
    await this.mailService.sendTestMail(email);

    return {
      message: 'Email sent successfully',
    };
  }
}