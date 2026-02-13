/**
 * Email Utility - Uses nodemailer for sending emails.
 * Falls back to console logging in development mode.
 */

const nodemailer = require('nodemailer');

/**
 * Create a transporter based on environment configuration.
 * In production, uses SMTP settings from environment variables.
 * In development without SMTP config, logs to console.
 */
const createTransporter = () => {
    if (process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASS) {
        return nodemailer.createTransport({
            host: process.env.SMTP_HOST,
            port: parseInt(process.env.SMTP_PORT, 10) || 587,
            secure: process.env.SMTP_SECURE === 'true',
            auth: {
                user: process.env.SMTP_USER,
                pass: process.env.SMTP_PASS
            }
        });
    }
    return null;
};

const sendEmail = async (options) => {
    const transporter = createTransporter();

    if (!transporter) {
        // Development fallback — log to console
        console.log('\n📧 ========== EMAIL (Development Mode) ==========');
        console.log('To:', options.email);
        console.log('Subject:', options.subject);
        console.log('Message:', options.message);
        console.log('===========================================================\n');
        return { success: true, message: 'Email logged (SMTP not configured)' };
    }

    const mailOptions = {
        from: process.env.SMTP_FROM || `"CodeSentinel" <${process.env.SMTP_USER}>`,
        to: options.email,
        subject: options.subject,
        text: options.message,
        html: options.html || undefined
    };

    try {
        const info = await transporter.sendMail(mailOptions);
        return { success: true, messageId: info.messageId };
    } catch (error) {
        console.error('Email send failed:', error.message);
        throw new Error('Failed to send email. Please try again later.');
    }
};

module.exports = sendEmail;