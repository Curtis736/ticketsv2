const sgMail = require('@sendgrid/mail');

// Initialize SendGrid (no password needed, just API key)
const SENDGRID_API_KEY = process.env.SENDGRID_API_KEY || 'YOUR_SENDGRID_API_KEY';
sgMail.setApiKey(SENDGRID_API_KEY);

const sendEmailNotification = async ({ to, subject, text, html, cc }) => {
  try {
    console.log('📧 Tentative d\'envoi d\'email:', { to, subject });
    
    if (!SENDGRID_API_KEY || SENDGRID_API_KEY === 'YOUR_SENDGRID_API_KEY') {
      console.log('⚠️ SendGrid non configuré. Email non envoyé:', { to, subject, text });
      return;
    }

    console.log('✅ Clé SendGrid détectée:', SENDGRID_API_KEY.substring(0, 10) + '...');

    // Convert text to HTML if html not provided
    const htmlContent = html || `<p>${(text || '').replace(/\n/g, '<br>')}</p>`;
    // Convert HTML to plain text if text not provided
    const textContent = text || html?.replace(/<[^>]*>/g, '').replace(/&nbsp;/g, ' ') || '';

    const msg = {
      to,
      from: process.env.SENDGRID_FROM_EMAIL || 'noreply@ticketsystem.com',
      subject,
      text: textContent,
      html: htmlContent
    };

    const ccEnv = process.env.TICKET_CC_EMAILS || '';
    const ccListFromEnv = ccEnv
      .split(',')
      .map((e) => e.trim())
      .filter((e) => e.length > 0);

    const ccList = Array.isArray(cc) ? cc : cc ? [cc] : [];
    const finalCc = [...new Set([...ccListFromEnv, ...ccList])];

    if (finalCc.length > 0) {
      msg.cc = finalCc;
    }

    console.log('📨 Envoi de l\'email à:', to);
    await sgMail.send(msg);
    console.log('✅ Email envoyé avec succès à:', to);
  } catch (error) {
    console.error('❌ Erreur lors de l\'envoi de l\'email:', error.response?.body || error.message);
    // Don't throw error - email is not critical
  }
};

module.exports = sendEmailNotification;

