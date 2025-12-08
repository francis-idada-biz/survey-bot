const nodemailer = require('nodemailer');
const { Resend } = require('resend');

class EmailService {
  constructor() {
    this.isProduction = process.env.NODE_ENV === 'production';
    
    if (this.isProduction) {
      // Production: Use Resend
      this.resend = new Resend(process.env.RESEND_API_KEY);
    }
    // Development: We'll create Ethereal transporter on-demand
  }

  async sendEmail({ to, subject, html }) {
    if (this.isProduction) {
      // Send with Resend
      try {
        const { data, error } = await this.resend.emails.send({
          from: process.env.EMAIL_FROM || 'Medical Eval Bot <onboarding@resend.dev>',
          to,
          subject,
          html,
        });

        if (error) {
          console.error('Resend error:', error);
          throw new Error(error.message);
        }

        console.log('✅ Email sent via Resend:', data.id);
        return { success: true, messageId: data.id };
      } catch (error) {
        console.error('Failed to send email via Resend:', error);
        throw error;
      }
    } else {
      // Development: Use Ethereal
      try {
        // Create test account on-demand
        const testAccount = await nodemailer.createTestAccount();
        
        const transporter = nodemailer.createTransporter({
          host: 'smtp.ethereal.email',
          port: 587,
          secure: false,
          auth: {
            user: testAccount.user,
            pass: testAccount.pass,
          },
        });

        const info = await transporter.sendMail({
          from: '"Medical Eval Bot" <no-reply@hospital.org>',
          to,
          subject,
          html,
        });

        console.log('📧 Message sent (Ethereal):', info.messageId);
        console.log('🔗 Preview URL:', nodemailer.getTestMessageUrl(info));
        
        return { 
          success: true, 
          messageId: info.messageId,
          previewUrl: nodemailer.getTestMessageUrl(info)
        };
      } catch (error) {
        console.error('Failed to send email via Ethereal:', error);
        throw error;
      }
    }
  }
}

module.exports = new EmailService();