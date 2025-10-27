const sgMail = require('@sendgrid/mail');

// Initialize SendGrid (no password needed, just API key)
const SENDGRID_API_KEY = process.env.SENDGRID_API_KEY || 'YOUR_SENDGRID_API_KEY';
sgMail.setApiKey(SENDGRID_API_KEY);

const sendEmailNotification = async ({ to, subject, text }) => {
  try {
    console.log('📧 Tentative d\'envoi d\'email:', { to, subject });
    
    if (!SENDGRID_API_KEY || SENDGRID_API_KEY === 'YOUR_SENDGRID_API_KEY') {
      console.log('⚠️ SendGrid non configuré. Email non envoyé:', { to, subject, text });
      return;
    }

    console.log('✅ Clé SendGrid détectée:', SENDGRID_API_KEY.substring(0, 10) + '...');

    const msg = {
      to,
      from: process.env.SENDGRID_FROM_EMAIL || 'noreply@ticketsystem.com',
      subject,
      text,
      html: `<p>${text}</p>`
    };

    console.log('📨 Envoi de l\'email à:', to);
    await sgMail.send(msg);
    console.log('✅ Email envoyé avec succès à:', to);
  } catch (error) {
    console.error('❌ Erreur lors de l\'envoi de l\'email:', error.response?.body || error.message);
    // Don't throw error - email is not critical
  }
};

module.exports = sendEmailNotification;

