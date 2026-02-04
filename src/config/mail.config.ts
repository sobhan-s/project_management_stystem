import { Resend } from 'resend';
import { config } from '../config/envConfig.js';
import { logger } from '../config/logger.config.js';

const resend = new Resend(config.resend.apiKey);

export const sendVerificationEmail = async (
  email: string,
  token: string,
): Promise<void> => {
  const verificationUrl = `http://localhost:8000/api/v1/auth/verify-email?token=${token}`;

  const { error } = await resend.emails.send({
    from: config.resend.emailFrom,
    to: email,
    subject: 'Verify Your Email Address',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 40px 20px;">
        <h2 style="color: #1a1a2e;">Verify Your Email</h2>
        <p style="color: #555;">Click the button below to verify your email address.</p>
        <a href="${verificationUrl}" style="display: inline-block; padding: 12px 24px; background-color: #1a1a2e; color: white; text-decoration: none; border-radius: 6px; margin: 20px 0;">
          Verify Email
        </a>
        <p style="color: #888; font-size: 14px;">This link will expire in 24 hours.</p>
        <p style="color: #888; font-size: 12px;">If you didn't create an account, ignore this email.</p>
      </div>
    `,
  });

  if (error) {
    logger.error('Failed to send verification email', { email, error });
    throw new Error('Failed to send verification email');
  }

  logger.info('Verification email sent', { email });
};

export const sendPasswordResetEmail = async (
  email: string,
  token: string,
): Promise<void> => {
  const resetUrl = `${'http://localhost:8000/api/v1/auth'}/reset-password?token=${token}`;

  const { error } = await resend.emails.send({
    from: config.resend.emailFrom,
    to: email,
    subject: 'Reset Your Password',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 40px 20px;">
        <h2 style="color: #1a1a2e;">Reset Your Password</h2>
        <p style="color: #555;">Click the button below to reset your password.</p>
        <a href="${resetUrl}" style="display: inline-block; padding: 12px 24px; background-color: #1a1a2e; color: white; text-decoration: none; border-radius: 6px; margin: 20px 0;">
          Reset Password
        </a>
        <p style="color: #888; font-size: 14px;">This link will expire in 1 hour.</p>
        <p style="color: #888; font-size: 12px;">If you didn't request a password reset, ignore this email.</p>
      </div>
    `,
  });

  if (error) {
    logger.error('Failed to send password reset email', { email, error });
    throw new Error('Failed to send password reset email');
  }

  logger.info('Password reset email sent', { email });
};
