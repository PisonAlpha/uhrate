import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

export async function sendVerificationCompleteEmail(
  email: string,
  fullName: string,
  fileName: string,
  rating: string,
  trustScore: number,
  certificateId: string,
  blockchainTx: string | null
) {
  try {
    const ratingColor = 
      rating === 'Verified Original' || rating === 'Likely Original' ? '#16a34a' :
      rating === 'Mixed Content' || rating === 'AI Assisted' ? '#d97706' : '#dc2626';

    const explorerUrl = blockchainTx
      ? 'https://testnet.bscscan.com/tx/' + blockchainTx
      : null;

    await resend.emails.send({
      from: process.env.RESEND_FROM_EMAIL!,
      to: email,
      subject: 'Your UHRATE verification is complete — ' + fileName,
      html: `
        <!DOCTYPE html>
        <html>
          <head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"></head>
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
                <h1 style="font-size: 20px; font-weight: 700; color: #111827; margin: 0 0 8px;">Verification Complete</h1>
                <p style="color: #6b7280; font-size: 15px; margin: 0 0 24px;">Hi ${fullName}, your file has been verified.</p>
                
                <div style="background: #f9fafb; border-radius: 12px; padding: 20px; margin-bottom: 24px;">
                  <p style="font-size: 13px; color: #6b7280; margin: 0 0 4px;">File</p>
                  <p style="font-size: 15px; font-weight: 500; color: #111827; margin: 0 0 16px;">${fileName}</p>
                  
                  <p style="font-size: 13px; color: #6b7280; margin: 0 0 4px;">Rating</p>
                  <p style="font-size: 18px; font-weight: 700; color: ${ratingColor}; margin: 0 0 16px;">${rating}</p>
                  
                  <p style="font-size: 13px; color: #6b7280; margin: 0 0 4px;">Trust Score</p>
                  <p style="font-size: 18px; font-weight: 700; color: #111827; margin: 0 0 16px;">${trustScore}/100</p>
                  
                  <p style="font-size: 13px; color: #6b7280; margin: 0 0 4px;">Certificate ID</p>
                  <p style="font-size: 13px; font-family: monospace; color: #2563eb; margin: 0;">${certificateId}</p>
                </div>

                ${explorerUrl ? `
                <a href="${explorerUrl}" style="display: block; background: #f9fafb; border: 1px solid #e5e7eb; color: #2563eb; text-align: center; padding: 12px; border-radius: 12px; font-size: 13px; text-decoration: none; margin-bottom: 16px; font-family: monospace;">
                  View on BNB Chain Explorer
                </a>
                ` : ''}

                <a href="https://uhrate.xyz/verify" style="display: block; background: black; color: white; text-align: center; padding: 14px; border-radius: 12px; font-weight: 600; font-size: 15px; text-decoration: none;">
                  View Certificate
                </a>
              </div>
              <div style="border-top: 1px solid #f3f4f6; padding: 16px 32px;">
                <p style="color: #9ca3af; font-size: 12px; margin: 0; text-align: center;">UHRATE — Decentralized Authenticity Network · uhrate.xyz</p>
              </div>
            </div>
          </body>
        </html>
      `,
    });

    return true;
  } catch (error) {
    console.error('Notification email error:', error);
    return false;
  }
}

export async function sendWelcomeEmail(
  email: string,
  fullName: string
) {
  try {
    await resend.emails.send({
      from: process.env.RESEND_FROM_EMAIL!,
      to: email,
      subject: 'Welcome to UHRATE — Start verifying digital content',
      html: `
        <!DOCTYPE html>
        <html>
          <head><meta charset="utf-8"></head>
          <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; background: #f9fafb; margin: 0; padding: 40px 20px;">
            <div style="max-width: 480px; margin: 0 auto; background: white; border-radius: 16px; border: 1px solid #e5e7eb; overflow: hidden;">
              <div style="background: black; padding: 24px; text-align: center;">
                <span style="color: white; font-weight: 600; font-size: 18px;">UHRATE</span>
              </div>
              <div style="padding: 32px;">
                <h1 style="font-size: 22px; font-weight: 700; color: #111827; margin: 0 0 8px;">Welcome to UHRATE, ${fullName}!</h1>
                <p style="color: #6b7280; font-size: 15px; margin: 0 0 24px;">You now have access to AI-powered digital authenticity verification.</p>
                
                <div style="space-y: 12px; margin-bottom: 24px;">
                  ${['Upload any image, video, audio, or document', 'Get instant AI deepfake and manipulation analysis', 'Receive blockchain-registered proof certificates', 'Use our public verification portal'].map(item => `
                    <div style="display: flex; align-items: center; gap: 12px; padding: 12px 0; border-bottom: 1px solid #f3f4f6;">
                      <span style="color: #16a34a; font-weight: bold;">✓</span>
                      <span style="font-size: 14px; color: #374151;">${item}</span>
                    </div>
                  `).join('')}
                </div>

                <a href="https://uhrate.xyz" style="display: block; background: black; color: white; text-align: center; padding: 14px; border-radius: 12px; font-weight: 600; font-size: 15px; text-decoration: none;">
                  Start verifying
                </a>
              </div>
            </div>
          </body>
        </html>
      `,
    });
    return true;
  } catch (error) {
    console.error('Welcome email error:', error);
    return false;
  }
}