import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

export async function sendVerificationEmail(
  email: string,
  fullName: string,
  token: string
) {
  const verifyUrl = `${process.env.NEXT_PUBLIC_APP_URL}/api/auth/verify-email?token=${token}`;

  const { data, error } = await resend.emails.send({
    from: process.env.RESEND_FROM_EMAIL!,
    to: email,
    subject: 'Verify your UHRATE account',
    html: `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1">
        </head>
        <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; background: #f9fafb; margin: 0; padding: 40px 20px;">
          <div style="max-width: 480px; margin: 0 auto; background: white; border-radius: 16px; border: 1px solid #e5e7eb; overflow: hidden;">
            <div style="background: black; padding: 24px; text-align: center;">
              <div style="display: inline-flex; align-items: center; gap: 10px;">
                <div style="width: 32px; height: 32px; background: white; border-radius: 8px; display: inline-flex; align-items: center; justify-content: center;">
                  <span style="font-weight: bold; font-size: 12px; color: black;">UH</span>
                </div>
                <span style="color: white; font-weight: 600; font-size: 18px;">UHRATE</span>
              </div>
            </div>
            <div style="padding: 32px;">
              <h1 style="font-size: 22px; font-weight: 700; color: #111827; margin: 0 0 8px;">Verify your email</h1>
              <p style="color: #6b7280; font-size: 15px; margin: 0 0 24px;">Hi ${fullName}, click the button below to verify your UHRATE account.</p>
              <a href="${verifyUrl}" style="display: block; background: black; color: white; text-align: center; padding: 14px; border-radius: 12px; font-weight: 600; font-size: 15px; text-decoration: none; margin-bottom: 24px;">
                Verify my account
              </a>
              <p style="color: #9ca3af; font-size: 13px; margin: 0;">This link expires in 24 hours. If you did not create an account, ignore this email.</p>
            </div>
            <div style="border-top: 1px solid #f3f4f6; padding: 16px 32px;">
              <p style="color: #9ca3af; font-size: 12px; margin: 0; text-align: center;">UHRATE — Decentralized Authenticity Network</p>
            </div>
          </div>
        </body>
      </html>
    `,
  });

  if (error) throw error;
  return data;
}