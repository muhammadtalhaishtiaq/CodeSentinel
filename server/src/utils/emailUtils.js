/**
 * Email Utility - Placeholder for future email service integration
 * Currently logs emails to console for development
 */

const sendEmail = async (options) => {
    console.log('\n📧 ========== EMAIL (Not Sent - Development Mode) ==========');
    console.log('To:', options.email);
    console.log('Subject:', options.subject);
    console.log('Message:', options.message);
    console.log('===========================================================\n');
    
    // Return success for development
    return {
        success: true,
        message: 'Email logged (not sent in development mode)'
    };
};

module.exports = sendEmail;