/**
 * Password Reset Email Template
 * Modern, responsive HTML email template for password reset requests
 */

const getResetPasswordEmailTemplate = (resetUrl, userName) => {
    return `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Reset Your Password</title>
    <style>
        body {
            margin: 0;
            padding: 0;
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
            background-color: #f3f4f6;
        }
        .container {
            max-width: 600px;
            margin: 0 auto;
            background-color: #ffffff;
        }
        .header {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            padding: 40px 30px;
            text-align: center;
        }
        .logo {
            font-size: 28px;
            font-weight: bold;
            color: #ffffff;
            margin: 0;
        }
        .content {
            padding: 40px 30px;
        }
        .greeting {
            font-size: 20px;
            font-weight: 600;
            color: #1f2937;
            margin: 0 0 20px 0;
        }
        .message {
            font-size: 16px;
            color: #4b5563;
            line-height: 1.6;
            margin: 0 0 30px 0;
        }
        .button-container {
            text-align: center;
            margin: 35px 0;
        }
        .reset-button {
            display: inline-block;
            padding: 14px 40px;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: #ffffff !important;
            text-decoration: none;
            border-radius: 8px;
            font-weight: 600;
            font-size: 16px;
            box-shadow: 0 4px 6px rgba(102, 126, 234, 0.3);
        }
        .warning {
            background-color: #fef3c7;
            border-left: 4px solid #f59e0b;
            padding: 15px;
            margin: 30px 0;
            border-radius: 4px;
        }
        .warning-text {
            font-size: 14px;
            color: #92400e;
            margin: 0;
        }
        .info-box {
            background-color: #f3f4f6;
            border-radius: 8px;
            padding: 20px;
            margin: 25px 0;
        }
        .info-title {
            font-size: 14px;
            font-weight: 600;
            color: #374151;
            margin: 0 0 10px 0;
        }
        .info-text {
            font-size: 14px;
            color: #6b7280;
            margin: 0;
            word-break: break-all;
        }
        .footer {
            background-color: #f9fafb;
            padding: 30px;
            text-align: center;
            border-top: 1px solid #e5e7eb;
        }
        .footer-text {
            font-size: 14px;
            color: #6b7280;
            margin: 5px 0;
        }
        .footer-link {
            color: #667eea;
            text-decoration: none;
        }
        @media only screen and (max-width: 600px) {
            .content {
                padding: 30px 20px;
            }
            .header {
                padding: 30px 20px;
            }
            .reset-button {
                padding: 12px 30px;
                font-size: 15px;
            }
        }
    </style>
</head>
<body>
    <div class="container">
        <!-- Header -->
        <div class="header">
            <h1 class="logo">
                CodeSentinel
            </h1>
        </div>
        
        <!-- Content -->
        <div class="content">
            <h2 class="greeting">Hi${userName ? ' ' + userName : ''},</h2>
            
            <p class="message">
                We received a request to reset your password for your CodeSentinel account. 
                If you made this request, click the button below to reset your password:
            </p>
            
            <div class="button-container">
                <a href="${resetUrl}" class="reset-button">Reset Your Password</a>
            </div>
            
            <div class="warning">
                <p class="warning-text">
                    <strong>⏰ This link expires in 10 minutes</strong> for security reasons. 
                    If it expires, you'll need to request a new password reset link.
                </p>
            </div>
            
            <div class="info-box">
                <p class="info-title">Can't click the button?</p>
                <p class="info-text">
                    Copy and paste this URL into your browser:<br>
                    <a href="${resetUrl}" style="color: #667eea;">${resetUrl}</a>
                </p>
            </div>
            
            <p class="message" style="margin-top: 30px;">
                If you didn't request a password reset, please ignore this email or 
                <a href="mailto:support@codesentinel.com" style="color: #667eea;">contact support</a> 
                if you're concerned about your account's security.
            </p>
        </div>
        
        <!-- Footer -->
        <div class="footer">
            <p class="footer-text">
                <strong>CodeSentinel</strong> - Security Vulnerability Scanner
            </p>
            <p class="footer-text">
                This is an automated message, please do not reply to this email.
            </p>
            <p class="footer-text" style="margin-top: 15px;">
                Need help? Visit our <a href="${process.env.BASE_URL || 'http://localhost:5173'}/documentation" class="footer-link">Documentation</a> 
                or <a href="mailto:support@codesentinel.com" class="footer-link">Contact Support</a>
            </p>
        </div>
    </div>
</body>
</html>
    `.trim();
};

module.exports = getResetPasswordEmailTemplate;
