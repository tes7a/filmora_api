import { Injectable, Logger } from '@nestjs/common';
import type { Transporter } from 'nodemailer';
import * as nodemailer from 'nodemailer';
import type SMTPTransport from 'nodemailer/lib/smtp-transport';

import { CoreConfig } from '../core';

export interface SendEmailOptions {
  to: string;
  subject: string;
  text?: string;
  html?: string;
}

@Injectable()
export class EmailService {
  private readonly logger = new Logger(EmailService.name);
  private transporter: Transporter<SMTPTransport.SentMessageInfo> | null = null;
  private readonly isConfigured: boolean;

  constructor(private readonly coreConfig: CoreConfig) {
    this.isConfigured = !!(
      this.coreConfig.smtpUser && this.coreConfig.smtpPassword
    );

    if (this.isConfigured) {
      this.transporter = nodemailer.createTransport({
        host: this.coreConfig.smtpHost,
        port: this.coreConfig.smtpPort,
        secure: this.coreConfig.smtpSecure,
        auth: {
          user: this.coreConfig.smtpUser,
          pass: this.coreConfig.smtpPassword,
        },
      });
      this.logger.log('Email service configured with SMTP');
    } else {
      this.logger.warn(
        'SMTP credentials not configured. Emails will be logged to console.',
      );
    }
  }

  async sendEmail(options: SendEmailOptions): Promise<boolean> {
    if (!this.isConfigured || !this.transporter) {
      this.logger.log(`
========== EMAIL (dev mode) ==========
To: ${options.to}
Subject: ${options.subject}
--------------------------------------
${options.text || 'See HTML content'}
======================================
      `);
      return true;
    }

    try {
      const info = await this.transporter.sendMail({
        from: `"${this.coreConfig.emailFromName}" <${this.coreConfig.emailFromAddress}>`,
        to: options.to,
        subject: options.subject,
        text: options.text,
        html: options.html,
      });

      this.logger.log(`Email sent: ${info.messageId}`);
      return true;
    } catch (error) {
      this.logger.error(`Failed to send email to ${options.to}`, error);
      return false;
    }
  }

  async sendConfirmationEmail(
    to: string,
    confirmationUrl: string,
  ): Promise<boolean> {
    return this.sendEmail({
      to,
      subject: 'Confirm your email address',
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Confirm your email</title>
        </head>
        <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
            <h1 style="color: white; margin: 0;">Welcome to Filmora!</h1>
          </div>

          <div style="background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px;">
            <p>Thank you for registering! Please confirm your email address by clicking the button below:</p>

            <div style="text-align: center; margin: 30px 0;">
              <a href="${confirmationUrl}"
                 style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                        color: white;
                        padding: 15px 30px;
                        text-decoration: none;
                        border-radius: 5px;
                        font-weight: bold;
                        display: inline-block;">
                Confirm Email
              </a>
            </div>

            <p style="color: #666; font-size: 14px;">
              If the button doesn't work, copy and paste this link into your browser:
              <br>
              <a href="${confirmationUrl}" style="color: #667eea; word-break: break-all;">${confirmationUrl}</a>
            </p>

            <p style="color: #666; font-size: 14px;">
              This link will expire in 24 hours.
            </p>

            <hr style="border: none; border-top: 1px solid #ddd; margin: 20px 0;">

            <p style="color: #999; font-size: 12px; text-align: center;">
              If you didn't create an account, you can safely ignore this email.
            </p>
          </div>
        </body>
        </html>
      `,
      text: `
        Welcome to Filmora!

        Thank you for registering! Please confirm your email address by clicking the link below:

        ${confirmationUrl}

        This link will expire in 24 hours.

        If you didn't create an account, you can safely ignore this email.
      `,
    });
  }
}
