import { Injectable, Logger } from '@nestjs/common';
import * as nodemailer from 'nodemailer';

export interface EmailOptions {
  to: string;
  subject: string;
  html: string;
  text?: string;
}

@Injectable()
export class EmailService {
  private readonly logger = new Logger(EmailService.name);
  private transporter: nodemailer.Transporter | null = null;

  constructor() {
    this.initializeTransporter();
  }

  private initializeTransporter() {
    const smtpHost = process.env.SMTP_HOST;
    const smtpPort = parseInt(process.env.SMTP_PORT || '587');
    const smtpUser = process.env.SMTP_USER;
    const smtpPass = process.env.SMTP_PASS;

    if (smtpHost && smtpUser && smtpPass) {
      // Configuração SMTP real
      this.transporter = nodemailer.createTransport({
        host: smtpHost,
        port: smtpPort,
        secure: smtpPort === 465,
        auth: {
          user: smtpUser,
          pass: smtpPass,
        },
      });
      this.logger.log('Transporter SMTP configurado');
    } else {
      // Mock para desenvolvimento
      this.transporter = nodemailer.createTransport({
        host: 'localhost',
        port: 1025,
        secure: false,
        ignoreTLS: true,
      });
      this.logger.log('Transporter mock configurado para desenvolvimento');
    }
  }

  async sendEmail(options: EmailOptions): Promise<boolean> {
    try {
      const from = process.env.SMTP_FROM || 'Atendechat <no-reply@exemplo.com>';
      
      const mailOptions = {
        from,
        to: options.to,
        subject: options.subject,
        html: options.html,
        text: options.text || this.htmlToText(options.html),
      };

      if (process.env.NODE_ENV === 'development' && !process.env.SMTP_HOST) {
        // Mock: apenas logar o email
        this.logger.log('📧 EMAIL MOCK (dev):');
        this.logger.log(`Para: ${options.to}`);
        this.logger.log(`Assunto: ${options.subject}`);
        this.logger.log(`HTML: ${options.html}`);
        return true;
      }

      const result = await this.transporter!.sendMail(mailOptions);
      this.logger.log(`Email enviado para ${options.to}: ${result.messageId}`);
      return true;
    } catch (error) {
      this.logger.error('Erro ao enviar email:', error);
      return false;
    }
  }

  async sendPasswordResetEmail(email: string, resetUrl: string): Promise<boolean> {
    const subject = 'Redefinição de Senha - Atendechat';
    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <title>Redefinição de Senha</title>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: #6366f1; color: white; padding: 20px; text-align: center; }
          .content { padding: 20px; background: #f9fafb; }
          .button { display: inline-block; padding: 12px 24px; background: #6366f1; color: white; text-decoration: none; border-radius: 6px; }
          .footer { text-align: center; padding: 20px; color: #6b7280; font-size: 14px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>🔐 Redefinição de Senha</h1>
          </div>
          <div class="content">
            <p>Olá!</p>
            <p>Recebemos uma solicitação para redefinir sua senha no Atendechat.</p>
            <p>Clique no botão abaixo para criar uma nova senha:</p>
            <p style="text-align: center;">
              <a href="${resetUrl}" class="button">Redefinir Senha</a>
            </p>
            <p><strong>Este link expira em 30 minutos.</strong></p>
            <p>Se você não solicitou esta redefinição, ignore este email.</p>
          </div>
          <div class="footer">
            <p>Este é um email automático, não responda.</p>
          </div>
        </div>
      </body>
      </html>
    `;

    return this.sendEmail({ to: email, subject, html });
  }

  async sendInviteEmail(email: string, inviteUrl: string, invitedBy: string, role: string): Promise<boolean> {
    const subject = 'Convite para Atendechat';
    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <title>Convite para Atendechat</title>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: #10b981; color: white; padding: 20px; text-align: center; }
          .content { padding: 20px; background: #f9fafb; }
          .button { display: inline-block; padding: 12px 24px; background: #10b981; color: white; text-decoration: none; border-radius: 6px; }
          .footer { text-align: center; padding: 20px; color: #6b7280; font-size: 14px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>🎉 Convite para Atendechat</h1>
          </div>
          <div class="content">
            <p>Olá!</p>
            <p><strong>${invitedBy}</strong> convidou você para participar do Atendechat como <strong>${role}</strong>.</p>
            <p>Clique no botão abaixo para aceitar o convite e criar sua conta:</p>
            <p style="text-align: center;">
              <a href="${inviteUrl}" class="button">Aceitar Convite</a>
            </p>
            <p><strong>Este convite expira em 72 horas.</strong></p>
          </div>
          <div class="footer">
            <p>Este é um email automático, não responda.</p>
          </div>
        </div>
      </body>
      </html>
    `;

    return this.sendEmail({ to: email, subject, html });
  }

  private htmlToText(html: string): string {
    return html
      .replace(/<[^>]*>/g, '')
      .replace(/&nbsp;/g, ' ')
      .replace(/&amp;/g, '&')
      .replace(/&lt;/g, '<')
      .replace(/&gt;/g, '>')
      .replace(/&quot;/g, '"')
      .trim();
  }
}
