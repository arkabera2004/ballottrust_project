import { Injectable } from '@nestjs/common';
import { MailerService } from '@nestjs-modules/mailer';

@Injectable()
export class MailService {
  constructor(
    private readonly mailerService: MailerService,
  ) {}

  async sendTestMail(email: string) {
    await this.mailerService.sendMail({
      to: email,
      subject: 'BallotTrust Test Email',

      html: `
      <div style="font-family:Arial,sans-serif;padding:30px">
        <h2 style="color:#2563eb;">BallotTrust</h2>

        <p>Hello,</p>

        <p>This is a test email from <strong>BallotTrust</strong>.</p>

        <p>
          If you received this email successfully,
          your SMTP configuration is working correctly.
        </p>

        <hr />

        <small>
          BallotTrust Enterprise Election Platform
        </small>
      </div>
      `,
    });
  }

  async sendOtpEmail(
    email: string,
    otp: string,
  ) {
    await this.mailerService.sendMail({
      to: email,
      subject: 'BallotTrust Verification Code',

      html: `
      <div style="font-family:Arial,sans-serif;padding:30px">

        <h2 style="color:#2563eb;">
          BallotTrust
        </h2>

        <p>Your verification code is:</p>

        <h1
          style="
            letter-spacing:8px;
            color:#2563eb;
          "
        >
          ${otp}
        </h1>

        <p>
          This code expires in
          <strong>10 minutes</strong>.
        </p>

        <p>
          Do not share this code with anyone.
        </p>

      </div>
      `,
    });
  }

  async sendResetPasswordEmail(
    email: string,
    resetLink: string,
  ) {
    await this.mailerService.sendMail({
      to: email,
      subject: 'Reset Your BallotTrust Password',

      html: `
      <div style="font-family:Arial,sans-serif;padding:30px">

        <h2 style="color:#2563eb;">
          BallotTrust
        </h2>

        <p>
          We received a request to reset your password.
        </p>

        <p>
          Click the button below:
        </p>

        <a
          href="${resetLink}"
          style="
            display:inline-block;
            padding:12px 20px;
            background:#2563eb;
            color:white;
            text-decoration:none;
            border-radius:8px;
          "
        >
          Reset Password
        </a>

        <p style="margin-top:20px;">
          If you didn't request this,
          simply ignore this email.
        </p>

      </div>
      `,
    });
  }

  async sendVerificationOtp(
  email: string,
  otp: string,
) {
  await this.mailerService.sendMail({
    to: email,

    subject: 'Verify your BallotTrust Account',

    html: `
      <div style="font-family:Arial;padding:30px">

        <h2 style="color:#2563eb;">
          BallotTrust
        </h2>

        <p>Welcome to BallotTrust.</p>

        <p>Your verification code is:</p>

        <h1
          style="
            letter-spacing:8px;
            color:#2563eb;
            font-size:42px;
          "
        >
          ${otp}
        </h1>

        <p>
          This OTP is valid for
          <strong>10 minutes</strong>.
        </p>

        <p>
          If you didn't create this account,
          simply ignore this email.
        </p>

      </div>
    `,
  });
}

async sendPasswordResetEmail(
  email: string,
  resetLink: string,
) {

  await this.mailerService.sendMail({

    to: email,

    subject: 'Reset Your BallotTrust Password',

    html: `

      <div
        style="
          max-width:600px;
          margin:auto;
          padding:40px;
          font-family:Arial,sans-serif;
          background:#ffffff;
        "
      >

        <h2
          style="
            color:#2563eb;
            margin-bottom:20px;
          "
        >
          BallotTrust
        </h2>

        <p>

          Hello,

        </p>

        <p>

          We received a request to reset your password.

        </p>

        <p>

          Click the button below to continue.

        </p>

        <a

          href="${resetLink}"

          style="
            display:inline-block;
            margin-top:20px;
            padding:14px 28px;
            background:#2563eb;
            color:#ffffff;
            text-decoration:none;
            border-radius:8px;
            font-weight:bold;
          "

        >

          Reset Password

        </a>

        <p style="margin-top:30px;">

          This link expires in
          <strong>15 minutes</strong>.

        </p>

        <p>

          If you didn't request this,
          simply ignore this email.

        </p>

        <hr
          style="
            margin:30px 0;
          "
        />

        <small style="color:#64748b;">

          BallotTrust Enterprise Election Platform

        </small>

      </div>

    `,

  });

}
}