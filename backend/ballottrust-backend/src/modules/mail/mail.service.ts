import { Injectable } from '@nestjs/common';
import { MailerService } from '@nestjs-modules/mailer';

@Injectable()
export class MailService {
  constructor(private readonly mailerService: MailerService) {}

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

  async sendOtpEmail(email: string, otp: string) {
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

  async sendResetPasswordEmail(email: string, resetLink: string) {
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

  async sendVerificationOtp(email: string, otp: string) {
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

  async sendPasswordResetEmail(email: string, resetLink: string) {
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

  /**
   * Generic notification email used by the Notification Center.
   *
   * Values are HTML-escaped before interpolation: notification text can
   * carry data that originated with a user (a candidate name, a rejection
   * reason), and this template is the one place that data reaches an
   * HTML document.
   */
  async sendNotificationEmail(params: {
    email: string;
    title: string;
    message: string;
    link?: string;
    actionLabel?: string;
  }) {
    const title = escapeHtml(params.title);
    const message = escapeHtml(params.message);

    const action =
      params.link && isSafeHttpUrl(params.link)
        ? `
        <p style="margin:24px 0;">
          <a
            href="${escapeHtml(params.link)}"
            style="
              background:#2563eb;
              color:#ffffff;
              padding:10px 18px;
              border-radius:6px;
              text-decoration:none;
              display:inline-block;
            "
          >
            ${escapeHtml(params.actionLabel ?? 'View in BallotTrust')}
          </a>
        </p>
      `
        : '';

    await this.mailerService.sendMail({
      to: params.email,
      subject: params.title,

      html: `
      <div style="font-family:Arial,sans-serif;padding:30px">

        <h2 style="color:#2563eb;">BallotTrust</h2>

        <h3 style="color:#0f172a;">${title}</h3>

        <p style="color:#334155;">${message}</p>

        ${action}

        <hr style="margin:30px 0;" />

        <small style="color:#64748b;">
          BallotTrust Enterprise Election Platform
        </small>

      </div>
      `,
    });
  }
}

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

/** Only absolute http(s) links become a clickable button. */
function isSafeHttpUrl(value: string): boolean {
  return /^https?:\/\//i.test(value.trim());
}
