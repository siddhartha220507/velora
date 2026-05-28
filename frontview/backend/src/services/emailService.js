const nodemailer = require('nodemailer');

// Configure the transporter with Gmail
const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
    }
});

/**
 * Send an email invitation for a team member
 * @param {string} email - Recipient's email address
 * @param {string} projectName - Name of the project
 * @param {string} inviteUrl - The URL to accept the invitation
 * @param {string} inviterName - Name of the person who invited them
 */
const sendInviteEmail = async (email, projectName, inviteUrl, inviterName) => {
    try {
        const mailOptions = {
            from: `"Velora Team" <${process.env.EMAIL_USER}>`,
            to: email,
            subject: `You have been invited to join ${projectName} on Velora`,
            html: `
                <!DOCTYPE html>
                <html lang="en">
                <head>
                    <meta charset="UTF-8">
                    <meta name="viewport" content="width=device-width, initial-scale=1.0">
                    <title>Velora Project Invitation</title>
                    <style>
                        body {
                            margin: 0;
                            padding: 0;
                            background-color: #0d1117;
                            font-family: 'Inter', -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
                            color: #c9d1d9;
                        }
                        .container {
                            width: 100%;
                            max-width: 600px;
                            margin: 0 auto;
                            padding: 40px 20px;
                        }
                        .card {
                            background-color: #161b22;
                            border: 1px solid #30363d;
                            border-radius: 12px;
                            padding: 40px;
                            text-align: center;
                            box-shadow: 0 8px 24px rgba(0, 0, 0, 0.2);
                        }
                        .logo {
                            font-size: 24px;
                            font-weight: 700;
                            color: #ffffff;
                            margin-bottom: 30px;
                            letter-spacing: -0.5px;
                        }
                        .title {
                            font-size: 20px;
                            font-weight: 600;
                            color: #ffffff;
                            margin-bottom: 16px;
                            line-height: 1.4;
                        }
                        .message {
                            font-size: 16px;
                            color: #8b949e;
                            margin-bottom: 32px;
                            line-height: 1.5;
                        }
                        .button {
                            display: inline-block;
                            background-color: #238636;
                            color: #ffffff;
                            text-decoration: none;
                            padding: 12px 24px;
                            border-radius: 6px;
                            font-size: 16px;
                            font-weight: 500;
                            transition: background-color 0.2s;
                        }
                        .button:hover {
                            background-color: #2ea043;
                        }
                        .footer {
                            margin-top: 32px;
                            font-size: 12px;
                            color: #484f58;
                        }
                    </style>
                </head>
                <body>
                    <div class="container">
                        <div class="card">
                            <div class="logo">Velora</div>
                            <h2 class="title">You've been invited to join a project!</h2>
                            <p class="message">
                                <strong>${inviterName}</strong> has invited you to collaborate on the project <strong>${projectName}</strong>.
                                Click the button below to accept the invitation and join the team.
                            </p>
                            <a href="${inviteUrl}" class="button">Accept Invitation</a>
                            <div class="footer">
                                If you did not expect this invitation, you can safely ignore this email.<br>
                                &copy; ${new Date().getFullYear()} Velora. All rights reserved.
                            </div>
                        </div>
                    </div>
                </body>
                </html>
            `
        };

        const info = await transporter.sendMail(mailOptions);
        console.log('Message sent: %s', info.messageId);
        return true;
    } catch (error) {
        console.error('Error sending email:', error);
        return false;
    }
};

const sendEmail = async (mailOptions) => {
    try {
        const defaultOptions = {
            from: `"Velora Team" <${process.env.EMAIL_USER}>`,
            ...mailOptions
        };
        const info = await transporter.sendMail(defaultOptions);
        console.log('Message sent: %s', info.messageId);
        return true;
    } catch (error) {
        console.error('Error sending generic email:', error);
        return false;
    }
};

module.exports = {
    sendInviteEmail,
    sendEmail
};
