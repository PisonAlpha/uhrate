import { Resend } from 'resend';
import { SUPPORTED_CHAINS } from './registry';

const resend = new Resend(process.env.RESEND_API_KEY);

function getExplorerUrl(chainId: string, txHash: string) {
  const chain = SUPPORTED_CHAINS.find(c => c.id === chainId);
  if (!chain || !txHash) return null;
  return `${chain.explorer}/tx/${txHash}`;
}

export async function sendVerificationCompleteEmail(
  email: string,
  fullName: string,
  fileName: string,
  rating: string,
  trustScore: number,
  certificateId: string,
  blockchainTx: string | null,
  chainId?: string
) {
  try {
    const ratingColor =
      rating === 'Verified Original' || rating === 'Likely Original' ? '#16a34a' :
      rating === 'Mixed Content' || rating === 'AI Assisted' ? '#d97706' : '#dc2626';

    const explorerUrl = blockchainTx && chainId
      ? getExplorerUrl(chainId, blockchainTx)
      : blockchainTx ? `https://bscscan.com/tx/${blockchainTx}` : null;

    const chainName = chainId
      ? SUPPORTED_CHAINS.find(c => c.id === chainId)?.name || chainId
      : 'BNB Chain';

    await resend.emails.send({
      from: process.env.RESEND_FROM_EMAIL!,
      to: email,
      subject: `Your UHRATE verification is complete — ${fileName}`,
      html: `
        <!DOCTYPE html>
        <html>
          <head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"></head>
          <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; background: #f9fafb; margin: 0; padding: 40px 20px;">
            <div style="max-width: 480px; margin: 0 auto; background: white; border-radius: 16px; border: 1px solid #e5e7eb; overflow: hidden;">
              <div style="background: black; padding: 24px; text-align: center;">
                <span style="color: white; font-weight: 700; font-size: 20px; letter-spacing: -0.5px;">UHRATE</span>
              </div>
              <div style="padding: 32px;">
                <h1 style="font-size: 20px; font-weight: 700; color: #111827; margin: 0 0 8px;">Verification Complete ✓</h1>
                <p style="color: #6b7280; font-size: 15px; margin: 0 0 24px;">Hi ${fullName}, your file has been verified on UHRATE.</p>

                <div style="background: #f9fafb; border-radius: 12px; padding: 20px; margin-bottom: 24px; border: 1px solid #e5e7eb;">
                  <table style="width: 100%; border-collapse: collapse;">
                    <tr><td style="font-size: 12px; color: #9ca3af; padding-bottom: 2px;">FILE</td></tr>
                    <tr><td style="font-size: 14px; font-weight: 500; color: #111827; padding-bottom: 16px;">${fileName}</td></tr>
                    <tr><td style="font-size: 12px; color: #9ca3af; padding-bottom: 2px;">RATING</td></tr>
                    <tr><td style="font-size: 20px; font-weight: 800; color: ${ratingColor}; padding-bottom: 16px;">${rating}</td></tr>
                    <tr><td style="font-size: 12px; color: #9ca3af; padding-bottom: 2px;">TRUST SCORE</td></tr>
                    <tr><td style="font-size: 20px; font-weight: 800; color: #111827; padding-bottom: 16px;">${trustScore}/100</td></tr>
                    <tr><td style="font-size: 12px; color: #9ca3af; padding-bottom: 2px;">CERTIFICATE ID</td></tr>
                    <tr><td style="font-size: 12px; font-family: monospace; color: #2563eb;">${certificateId}</td></tr>
                  </table>
                </div>

                ${explorerUrl ? `
                <a href="${explorerUrl}" style="display: block; background: #f0f9ff; border: 1px solid #bae6fd; color: #0369a1; text-align: center; padding: 12px; border-radius: 12px; font-size: 13px; text-decoration: none; margin-bottom: 12px;">
                  ⛓ View on ${chainName} Explorer ↗
                </a>
                ` : ''}

                <a href="https://uhrate.xyz/dashboard" style="display: block; background: black; color: white; text-align: center; padding: 14px; border-radius: 12px; font-weight: 600; font-size: 15px; text-decoration: none; margin-bottom: 12px;">
                  View in Dashboard →
                </a>
                <a href="https://uhrate.xyz/verify" style="display: block; background: #f9fafb; border: 1px solid #e5e7eb; color: #374151; text-align: center; padding: 12px; border-radius: 12px; font-size: 13px; text-decoration: none;">
                  Verify Another File
                </a>
              </div>
              <div style="border-top: 1px solid #f3f4f6; padding: 16px 32px; text-align: center;">
                <p style="color: #9ca3af; font-size: 12px; margin: 0;">UHRATE — Decentralized Authenticity Network · uhrate.xyz</p>
              </div>
            </div>
          </body>
        </html>
      `,
    });
    return true;
  } catch (error) {
    console.error('Verification email error:', error);
    return false;
  }
}

export async function sendBlockchainDeploymentEmail(
  email: string,
  fullName: string,
  fileName: string,
  chainId: string,
  txHash: string,
  certificateId: string
) {
  try {
    const chain = SUPPORTED_CHAINS.find(c => c.id === chainId);
    const explorerUrl = chain ? `${chain.explorer}/tx/${txHash}` : null;
    const chainName = chain?.name || chainId;

    await resend.emails.send({
      from: process.env.RESEND_FROM_EMAIL!,
      to: email,
      subject: `Your document is now on the blockchain — ${fileName}`,
      html: `
        <!DOCTYPE html>
        <html>
          <head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"></head>
          <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; background: #f9fafb; margin: 0; padding: 40px 20px;">
            <div style="max-width: 480px; margin: 0 auto; background: white; border-radius: 16px; border: 1px solid #e5e7eb; overflow: hidden;">
              <div style="background: black; padding: 24px; text-align: center;">
                <span style="color: white; font-weight: 700; font-size: 20px;">UHRATE</span>
              </div>
              <div style="padding: 32px;">
                <div style="text-align: center; margin-bottom: 24px;">
                  <div style="width: 56px; height: 56px; background: #f0fdf4; border-radius: 50%; display: inline-flex; align-items: center; justify-content: center; margin-bottom: 12px; font-size: 24px;">⛓</div>
                  <h1 style="font-size: 20px; font-weight: 700; color: #111827; margin: 0 0 8px;">Document On-Chain!</h1>
                  <p style="color: #6b7280; font-size: 14px; margin: 0;">Hi ${fullName}, your document now has a permanent blockchain identity.</p>
                </div>

                <div style="background: #f9fafb; border-radius: 12px; padding: 20px; margin-bottom: 24px; border: 1px solid #e5e7eb;">
                  <table style="width: 100%; border-collapse: collapse;">
                    <tr><td style="font-size: 12px; color: #9ca3af; padding-bottom: 2px;">FILE</td></tr>
                    <tr><td style="font-size: 14px; font-weight: 500; color: #111827; padding-bottom: 16px;">${fileName}</td></tr>
                    <tr><td style="font-size: 12px; color: #9ca3af; padding-bottom: 2px;">NETWORK</td></tr>
                    <tr><td style="font-size: 14px; font-weight: 600; color: #111827; padding-bottom: 16px;">${chainName}</td></tr>
                    <tr><td style="font-size: 12px; color: #9ca3af; padding-bottom: 2px;">CERTIFICATE ID</td></tr>
                    <tr><td style="font-size: 12px; font-family: monospace; color: #2563eb; padding-bottom: 16px;">${certificateId}</td></tr>
                    <tr><td style="font-size: 12px; color: #9ca3af; padding-bottom: 2px;">TRANSACTION</td></tr>
                    <tr><td style="font-size: 11px; font-family: monospace; color: #374151; word-break: break-all;">${txHash}</td></tr>
                  </table>
                </div>

                <div style="background: #fefce8; border: 1px solid #fef08a; border-radius: 12px; padding: 16px; margin-bottom: 24px;">
                  <p style="font-size: 13px; color: #713f12; margin: 0;">
                    🔐 This document is now permanently recorded on the ${chainName} blockchain. The record is immutable and verifiable by anyone, anywhere, forever.
                  </p>
                </div>

                ${explorerUrl ? `
                <a href="${explorerUrl}" style="display: block; background: #f0f9ff; border: 1px solid #bae6fd; color: #0369a1; text-align: center; padding: 12px; border-radius: 12px; font-size: 13px; text-decoration: none; margin-bottom: 12px;">
                  View on ${chainName} Explorer ↗
                </a>
                ` : ''}

                <a href="https://uhrate.xyz/dashboard" style="display: block; background: black; color: white; text-align: center; padding: 14px; border-radius: 12px; font-weight: 600; font-size: 15px; text-decoration: none;">
                  View in Dashboard →
                </a>
              </div>
              <div style="border-top: 1px solid #f3f4f6; padding: 16px 32px; text-align: center;">
                <p style="color: #9ca3af; font-size: 12px; margin: 0;">UHRATE — Decentralized Authenticity Network · uhrate.xyz</p>
              </div>
            </div>
          </body>
        </html>
      `,
    });
    return true;
  } catch (error) {
    console.error('Blockchain deployment email error:', error);
    return false;
  }
}

export async function sendWelcomeEmail(email: string, fullName: string) {
  try {
    await resend.emails.send({
      from: process.env.RESEND_FROM_EMAIL!,
      to: email,
      subject: 'Welcome to UHRATE — The Decentralized Authenticity Network',
      html: `
        <!DOCTYPE html>
        <html>
          <head><meta charset="utf-8"></head>
          <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; background: #f9fafb; margin: 0; padding: 40px 20px;">
            <div style="max-width: 480px; margin: 0 auto; background: white; border-radius: 16px; border: 1px solid #e5e7eb; overflow: hidden;">
              <div style="background: black; padding: 24px; text-align: center;">
                <span style="color: white; font-weight: 700; font-size: 20px;">UHRATE</span>
              </div>
              <div style="padding: 32px;">
                <h1 style="font-size: 22px; font-weight: 700; color: #111827; margin: 0 0 8px;">Welcome, ${fullName}! 🎉</h1>
                <p style="color: #6b7280; font-size: 15px; margin: 0 0 24px;">You now have access to AI-powered document authenticity verification with permanent blockchain proof.</p>

                <div style="margin-bottom: 24px;">
                  ${[
                    ['🔍', 'Verify any file', 'Upload images, videos, documents — AI checks for deepfakes and manipulation'],
                    ['🏆', 'Get NFT certificates', 'Receive blockchain-registered proof of authenticity'],
                    ['⛓', 'Deploy on-chain', 'Give your documents permanent on-chain identity for just $0.50'],
                    ['🌐', 'Public verification', 'Anyone can verify your documents — no account needed'],
                  ].map(([icon, title, desc]) => `
                    <div style="display: flex; gap: 12px; padding: 12px 0; border-bottom: 1px solid #f3f4f6;">
                      <span style="font-size: 20px; flex-shrink: 0;">${icon}</span>
                      <div>
                        <p style="font-size: 14px; font-weight: 600; color: #111827; margin: 0 0 2px;">${title}</p>
                        <p style="font-size: 13px; color: #6b7280; margin: 0;">${desc}</p>
                      </div>
                    </div>
                  `).join('')}
                </div>

                <a href="https://uhrate.xyz" style="display: block; background: black; color: white; text-align: center; padding: 14px; border-radius: 12px; font-weight: 600; font-size: 15px; text-decoration: none; margin-bottom: 12px;">
                  Start Verifying →
                </a>
                <a href="https://uhrate.xyz/verify" style="display: block; background: #f9fafb; border: 1px solid #e5e7eb; color: #374151; text-align: center; padding: 12px; border-radius: 12px; font-size: 13px; text-decoration: none;">
                  Try Public Verification (No Login)
                </a>
              </div>
              <div style="border-top: 1px solid #f3f4f6; padding: 16px 32px; text-align: center;">
                <p style="color: #9ca3af; font-size: 12px; margin: 0;">UHRATE — Decentralized Authenticity Network · uhrate.xyz</p>
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