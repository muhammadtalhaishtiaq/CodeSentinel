const Mailjet = require('node-mailjet');

const sendEmail = async(options) => {
    // Check if email is configured
    if (!process.env.MJ_APIKEY_PUBLIC || !process.env.MJ_APIKEY_PRIVATE) {
        console.warn('⚠️  Email service not configured. Skipping email send.');
        console.log(`Would have sent email to: ${options.email}`);
        console.log(`Subject: ${options.subject}`);
        return { success: false, message: 'Email service not configured' };
    }

    try {
        const mailjet = new Mailjet({
            apiKey: process.env.MJ_APIKEY_PUBLIC,
            apiSecret: process.env.MJ_APIKEY_PRIVATE
        });

        const request = mailjet
            .post('send', { version: 'v3.1' })
            .request({
                Messages: [{
                    From: {
                        Email: process.env.SENDER_EMAIL || 'noreply@codesentinel.com',
                        Name: 'CodeSentinel'
                    },
                    To: [{
                        Email: options.email,
                        Name: options.email.split('@')[0]
                    }],
                    Subject: options.subject,
                    HTMLPart: options.message
                }]
            });

        const result = await request;
        console.log('✅ Email sent successfully:', result.body);
        return result;
    } catch (error) {
        console.error('❌ Error sending email:', error);
        throw new Error('Email could not be sent');
    }
};

module.exports = sendEmail;