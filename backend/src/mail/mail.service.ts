import { Injectable, Logger } from '@nestjs/common';
import * as nodemailer from 'nodemailer';

@Injectable()
export class MailService {
  private readonly logger = new Logger(MailService.name);
  private transporter: nodemailer.Transporter;

  constructor() {
    this.transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.GMAIL_USER,
        pass: process.env.GMAIL_APP_PASSWORD,
      },
    });
  }

  async sendPasswordReset(to: string, name: string, resetUrl: string): Promise<void> {
    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <title>Reset your FarmStand password</title>
      </head>
      <body style="margin:0;padding:0;background:#0a1a0f;font-family:Inter,system-ui,sans-serif;">
        <table width="100%" cellpadding="0" cellspacing="0" style="background:#0a1a0f;padding:40px 16px;">
          <tr>
            <td align="center">
              <table width="100%" cellpadding="0" cellspacing="0" style="max-width:520px;background:#0f2318;border-radius:16px;border:1px solid #1e4a2c;overflow:hidden;">
                <!-- Header -->
                <tr>
                  <td style="padding:32px 40px 24px;border-bottom:1px solid #1e4a2c;">
                    <p style="margin:0;font-size:22px;font-weight:700;color:#4ade80;">🌱 FarmStand</p>
                  </td>
                </tr>
                <!-- Body -->
                <tr>
                  <td style="padding:32px 40px;">
                    <h1 style="margin:0 0 8px;font-size:22px;font-weight:700;color:#e2f0e6;">Reset your password</h1>
                    <p style="margin:0 0 24px;font-size:15px;color:#7aad84;line-height:1.6;">
                      Hi ${name},<br/>
                      We received a request to reset the password for your FarmStand account.
                      Click the button below to set a new password. This link expires in <strong style="color:#4ade80;">1 hour</strong>.
                    </p>
                    <table cellpadding="0" cellspacing="0">
                      <tr>
                        <td style="border-radius:10px;background:#16a34a;">
                          <a href="${resetUrl}"
                            style="display:inline-block;padding:14px 32px;font-size:15px;font-weight:600;color:#ffffff;text-decoration:none;border-radius:10px;">
                            Reset Password
                          </a>
                        </td>
                      </tr>
                    </table>
                    <p style="margin:24px 0 0;font-size:13px;color:#5a8f64;line-height:1.6;">
                      Or copy this link into your browser:<br/>
                      <a href="${resetUrl}" style="color:#4ade80;word-break:break-all;">${resetUrl}</a>
                    </p>
                    <p style="margin:24px 0 0;font-size:13px;color:#5a8f64;">
                      If you didn't request a password reset, you can safely ignore this email.
                      Your password will not be changed.
                    </p>
                  </td>
                </tr>
                <!-- Footer -->
                <tr>
                  <td style="padding:20px 40px;border-top:1px solid #1e4a2c;">
                    <p style="margin:0;font-size:12px;color:#3d6b44;">
                      © ${new Date().getFullYear()} FarmStand · Fresh Produce Marketplace
                    </p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
        </table>
      </body>
      </html>
    `;

    try {
      await this.transporter.sendMail({
        from: `"FarmStand" <${process.env.GMAIL_USER}>`,
        to,
        subject: 'Reset your FarmStand password',
        html,
      });
      this.logger.log(`Password reset email sent to ${to}`);
    } catch (err) {
      this.logger.error(`Failed to send password reset email to ${to}`, err);
      throw err;
    }
  }
}
