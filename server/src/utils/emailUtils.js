const Mailjet = require('node-mailjet');

const mailjet = new Mailjet({
    apiKey: process.env.MJ_APIKEY_PUBLIC,
    apiSecret: process.env.MJ_APIKEY_PRIVATE
});

const sendEmail = async(options) => {
    try {
        const request = mailjet
            .post('send', { version: 'v3.1' })
            .request({
                Messages: [{
                    From: {
                        Email: process.env.SENDER_EMAIL,
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
        console.log('Email sent successfully:', result.body);
        return result;
    } catch (error) {
        console.error('Error sending email:', error);
        throw new Error('Email could not be sent');
    }
};

module.exports = sendEmail;