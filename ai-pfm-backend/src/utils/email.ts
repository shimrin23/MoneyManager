import axios from 'axios';

export const sendVerificationEmail = async (email: string, token: string) => {
    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
    const verificationUrl = `${frontendUrl}/verify-email?token=${token}`;

    console.log('\n==================================================');
    console.log(`✉️  EMAIL VERIFICATION LINK FOR ${email}:`);
    console.log(verificationUrl);
    console.log('==================================================\n');

    const apiKey = process.env.RESEND_API_KEY;
    if (!apiKey || apiKey.startsWith('your_') || apiKey === '') {
        console.log('ℹ️  Resend API key not configured. Link printed to console only.');
        return;
    }

    try {
        await axios.post(
            'https://api.resend.com/emails',
            {
                from: process.env.MAIL_FROM || 'MoneyManager <no-reply@snis.app>',
                to: [email],
                subject: 'Verify Your Email - MoneyManager',
                html: `
                    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #0f172a; color: #f1f5f9; border-radius: 12px; border: 1px solid rgba(255,255,255,0.08);">
                        <h2 style="color: #818cf8; text-align: center; margin-bottom: 24px;">Welcome to MoneyManager!</h2>
                        <p>Thank you for signing up. Please click the button below to verify your email address and activate your account:</p>
                        <div style="text-align: center; margin: 32px 0;">
                            <a href="${verificationUrl}" style="background: linear-gradient(135deg, #6366f1, #8b5cf6); color: white; padding: 12px 28px; text-decoration: none; border-radius: 8px; display: inline-block; font-weight: 600; box-shadow: 0 4px 12px rgba(99, 102, 241, 0.3);">Verify Email Address</a>
                        </div>
                        <p>This verification link will expire in <strong>1 hour</strong>.</p>
                        <p style="color: rgba(255,255,255,0.5); font-size: 0.85rem; margin-top: 32px;">If you did not request this registration, you can safely ignore this email.</p>
                    </div>
                `,
            },
            {
                headers: {
                    Authorization: `Bearer ${apiKey}`,
                    'Content-Type': 'application/json',
                },
            }
        );
        console.log(`✔️ Verification email successfully sent to ${email} via Resend.`);
    } catch (error: any) {
        console.error('❌ Error sending verification email via Resend:', error.response?.data || error.message);
    }
};

export const sendWelcomeEmail = async (email: string, name: string) => {
    console.log(`\n✉️  SENDING WELCOME EMAIL TO ${email}...\n`);

    const apiKey = process.env.RESEND_API_KEY;
    if (!apiKey || apiKey.startsWith('your_') || apiKey === '') {
        console.log('ℹ️  Resend API key not configured. Welcome email simulated.');
        return;
    }

    try {
        await axios.post(
            'https://api.resend.com/emails',
            {
                from: process.env.MAIL_FROM || 'MoneyManager <no-reply@snis.app>',
                to: [email],
                subject: 'Welcome to MoneyManager!',
                html: `
                    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #0f172a; color: #f1f5f9; border-radius: 12px; border: 1px solid rgba(255,255,255,0.08);">
                        <h2 style="color: #10b981; text-align: center; margin-bottom: 24px;">Welcome, ${name}!</h2>
                        <p>Your email address has been successfully verified.</p>
                        <p>You can now log in and take full advantage of our AI-powered Personal Financial Management module:</p>
                        <ul style="line-height: 1.6;">
                            <li>Get AI-powered spending insights and recommendations</li>
                            <li>Monitor your real-time Financial Health Score</li>
                            <li>Forecast your cash flows and prevent balance dropouts</li>
                            <li>Set and optimize intelligent savings goals</li>
                        </ul>
                        <div style="text-align: center; margin: 32px 0;">
                            <a href="${process.env.FRONTEND_URL || 'http://localhost:5173'}/login" style="background: linear-gradient(135deg, #10b981, #059669); color: white; padding: 12px 28px; text-decoration: none; border-radius: 8px; display: inline-block; font-weight: 600; box-shadow: 0 4px 12px rgba(16, 185, 129, 0.3);">Go to Login</a>
                        </div>
                        <p style="color: rgba(255,255,255,0.5); font-size: 0.85rem; margin-top: 32px;">Happy saving!<br>The MoneyManager Team</p>
                    </div>
                `,
            },
            {
                headers: {
                    Authorization: `Bearer ${apiKey}`,
                    'Content-Type': 'application/json',
                },
            }
        );
        console.log(`✔️ Welcome email successfully sent to ${email} via Resend.`);
    } catch (error: any) {
        console.error('❌ Error sending welcome email via Resend:', error.response?.data || error.message);
    }
};

export const sendResetPasswordEmail = async (email: string, token: string) => {
    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
    const resetUrl = `${frontendUrl}/reset-password?token=${token}`;

    console.log('\n==================================================');
    console.log(`✉️  PASSWORD RESET LINK FOR ${email}:`);
    console.log(resetUrl);
    console.log('==================================================\n');

    const apiKey = process.env.RESEND_API_KEY;
    if (!apiKey || apiKey.startsWith('your_') || apiKey === '') {
        console.log('ℹ️  Resend API key not configured. Reset link printed to console only.');
        return;
    }

    try {
        await axios.post(
            'https://api.resend.com/emails',
            {
                from: process.env.MAIL_FROM || 'MoneyManager <no-reply@snis.app>',
                to: [email],
                subject: 'Reset Your Password - MoneyManager',
                html: `
                    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #0f172a; color: #f1f5f9; border-radius: 12px; border: 1px solid rgba(255,255,255,0.08);">
                        <h2 style="color: #f59e0b; text-align: center; margin-bottom: 24px;">Reset Your Password</h2>
                        <p>We received a request to reset your password. Click the button below to choose a new password:</p>
                        <div style="text-align: center; margin: 32px 0;">
                            <a href="${resetUrl}" style="background: linear-gradient(135deg, #f59e0b, #d97706); color: white; padding: 12px 28px; text-decoration: none; border-radius: 8px; display: inline-block; font-weight: 600; box-shadow: 0 4px 12px rgba(245, 158, 11, 0.3);">Reset Password</a>
                        </div>
                        <p>This reset link will expire in <strong>1 hour</strong>.</p>
                        <p style="color: rgba(255,255,255,0.5); font-size: 0.85rem; margin-top: 32px;">If you did not request this, you can safely ignore this email. Your password will remain unchanged.</p>
                    </div>
                `,
            },
            {
                headers: {
                    Authorization: `Bearer ${apiKey}`,
                    'Content-Type': 'application/json',
                },
            }
        );
        console.log(`✔️ Password reset email successfully sent to ${email} via Resend.`);
    } catch (error: any) {
        console.error('❌ Error sending password reset email via Resend:', error.response?.data || error.message);
    }
};
