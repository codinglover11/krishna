/**
 * Modular Email Provider Strategy Architecture
 * Clean provider abstraction supporting:
 * 1. Resend (RESEND_API_KEY)
 * 2. Brevo (BREVO_API_KEY)
 * 3. SMTP (Development / Fallback nodemailer or simulation)
 */

class EmailProvider {
  async send({ to, subject, html, text }) {
    throw new Error('EmailProvider.send method must be implemented by subclass.');
  }
}

class ResendProvider extends EmailProvider {
  constructor(apiKey) {
    super();
    this.apiKey = apiKey;
  }

  async send({ to, subject, html, text }) {
    console.log(`[ResendProvider] Dispatching email to: ${to} | Subject: "${subject}"`);
    try {
      let response = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          from: process.env.EMAIL_FROM || 'onboarding@resend.dev',
          to: [to],
          subject,
          html: html || `<p>${text}</p>`,
          text
        })
      });
      let data = await response.json();

      // Handle Resend free-tier testing limitation (only allowed to send to account owner's email)
      if (!response.ok && data.message && data.message.includes('only send testing emails')) {
        const fallbackEmail = process.env.ADMIN_EMAIL || 'piyushtewani11@gmail.com';
        console.warn(`[ResendProvider] Resend free-tier domain restriction: Falling back dispatch to account owner (${fallbackEmail}).`);
        response = await fetch('https://api.resend.com/emails', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${this.apiKey}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            from: process.env.EMAIL_FROM || 'onboarding@resend.dev',
            to: [fallbackEmail],
            subject: `[ADMIN ALERT] ${subject}`,
            html: html || `<p>${text}</p>`,
            text
          })
        });
        data = await response.json();
      }

      if (!response.ok) {
        console.warn(`[ResendProvider] Warning:`, data.message || 'Resend dispatch failed');
        return { success: false, provider: 'resend', error: data.message };
      }
      return { success: true, provider: 'resend', id: data.id };
    } catch (err) {
      console.warn('[ResendProvider] Error:', err.message);
      return { success: false, provider: 'resend', error: err.message };
    }
  }
}

class BrevoProvider extends EmailProvider {
  constructor(apiKey) {
    super();
    this.apiKey = apiKey;
  }

  async send({ to, subject, html, text }) {
    console.log(`[BrevoProvider] Dispatching email to: ${to} | Subject: "${subject}"`);
    try {
      const response = await fetch('https://api.brevo.com/v3/smtp/email', {
        method: 'POST',
        headers: {
          'api-key': this.apiKey,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          sender: { name: 'Krishna Footwear', email: 'no-reply@krishnafootwear.com' },
          to: [{ email: to }],
          subject,
          htmlContent: html || `<p>${text}</p>`,
          textContent: text
        })
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.message || 'Brevo dispatch failed');
      return { success: true, provider: 'brevo', messageId: data.messageId };
    } catch (err) {
      console.warn('[BrevoProvider] Error:', err.message);
      throw err;
    }
  }
}

class SMTPProvider extends EmailProvider {
  constructor(config = {}) {
    super();
    this.config = config;
    this.transporter = null;

    if (process.env.SMTP_USER) {
      try {
        const nodemailer = require('nodemailer');
        this.transporter = nodemailer.createTransport({
          host: config.host || process.env.SMTP_HOST || 'smtp.gmail.com',
          port: parseInt(config.port || process.env.SMTP_PORT || '587', 10),
          secure: config.port === 465,
          auth: {
            user: config.user || process.env.SMTP_USER,
            pass: config.pass || process.env.SMTP_PASS
          }
        });
      } catch (e) {
        console.warn('[SMTPProvider] nodemailer package not loaded, using HTTP/Console dispatch mode.');
      }
    }
  }

  async send({ to, subject, html, text }) {
    console.log(`[SMTPProvider] Dispatching email to: ${to} | Subject: "${subject}"`);
    
    if (!this.transporter || !process.env.SMTP_USER) {
      console.log(`[Email Dispatch Simulation] To: ${to} | Subject: "${subject}" | Content: ${text}`);
      return { success: true, provider: 'smtp-simulation', recipient: to };
    }

    const info = await this.transporter.sendMail({
      from: process.env.SMTP_FROM || 'Krishna Footwear <no-reply@krishnafootwear.com>',
      to,
      subject,
      text,
      html: html || `<p>${text}</p>`
    });
    return { success: true, provider: 'smtp', messageId: info.messageId };
  }
}

// Factory function to get active provider based on environment keys
const getEmailProvider = () => {
  if (process.env.RESEND_API_KEY) {
    return new ResendProvider(process.env.RESEND_API_KEY);
  }
  if (process.env.BREVO_API_KEY) {
    return new BrevoProvider(process.env.BREVO_API_KEY);
  }
  return new SMTPProvider({});
};

module.exports = {
  EmailProvider,
  ResendProvider,
  BrevoProvider,
  SMTPProvider,
  getEmailProvider
};
