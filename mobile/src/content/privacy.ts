import type { Policy } from './types';

// Copied from the website's /privacy page (app/privacy/page.tsx). Keep in step with it.
export const privacyPolicy: Policy = {
  title: 'Privacy Policy',
  updated: 'June 2026',
  sections: [
    {
      heading: '1. Information We Collect',
      paragraphs: [
        'When you create an account, we collect your name, email address, and a hashed password. When you verify files, we process the file content temporarily for analysis and store the resulting cryptographic fingerprints (SHA-256, perceptual hashes), AI analysis scores, and certificate metadata.',
        'When you connect a cryptocurrency wallet (e.g., MetaMask), we may record the public wallet address and transaction hashes associated with your actions (NFT minting, document registration, payments). We never have access to your private keys.',
      ],
    },
    {
      heading: '2. How We Use Your Information',
      paragraphs: [
        'We use collected information to: provide verification results, maintain your account and verification history (Dashboard), track free-tier usage credits, send transactional emails (verification completed, welcome emails), process plan upgrades, and respond to support/contact inquiries.',
      ],
    },
    {
      heading: '3. AI Processing of Uploaded Content',
      paragraphs: [
        "Uploaded files (or relevant excerpts/images) may be sent to third-party AI providers (such as Anthropic's Claude API) for analysis purposes. This content is processed to generate authenticity scores and is not used by UHRATE to train AI models. Refer to the relevant AI provider's policies for how they handle data sent via API.",
      ],
    },
    {
      heading: '4. Blockchain and Public Data',
      paragraphs: [
        'Information you choose to register on a blockchain (document hashes, registry metadata, NFT certificates) becomes permanently public and immutable on that blockchain. This data cannot be deleted or modified by UHRATE once submitted. Do not register sensitive personal information on-chain that you do not want to be publicly visible forever.',
      ],
    },
    {
      heading: '5. Decentralized Storage (IPFS)',
      paragraphs: [
        'Certificate data may be uploaded to IPFS (via Pinata) for decentralized storage. Content pinned to IPFS may be accessible by anyone with the corresponding hash and may persist on the network independently of UHRATE.',
      ],
    },
    {
      heading: '6. Data Storage and Security',
      paragraphs: [
        'Account and verification data is stored in our database (Supabase) with access controls. While we take reasonable measures to protect your data, no system is completely secure, and we cannot guarantee absolute security.',
      ],
    },
    {
      heading: '7. Third-Party Services',
      paragraphs: [
        'We use third-party services including Supabase (database), Anthropic (AI analysis), Resend (email delivery), Pinata (IPFS storage), and public blockchain networks (BNB Smart Chain and others). These providers may process your data according to their own privacy policies.',
      ],
    },
    {
      heading: '8. Data Retention',
      paragraphs: [
        'We retain account and verification records for as long as your account is active. Data registered on a blockchain or IPFS cannot be retained or deleted on a fixed schedule, as it is permanent by design once submitted.',
      ],
    },
    {
      heading: '9. Your Rights',
      paragraphs: [
        'You may request access to, correction of, or deletion of your account data (excluding immutable on-chain or IPFS records, which cannot be altered) by contacting us through our contact form (uhrate.online/contact).',
      ],
    },
    {
      heading: '10. Cookies',
      paragraphs: [
        'We use minimal local storage in your browser to keep you logged in and remember preferences. We do not use third-party advertising trackers.',
      ],
    },
    {
      heading: "11. Children's Privacy",
      paragraphs: [
        'UHRATE is not directed at children under 13, and we do not knowingly collect personal information from children under 13.',
      ],
    },
    {
      heading: '12. Changes to This Policy',
      paragraphs: [
        'We may update this Privacy Policy from time to time. Continued use of the Service after changes constitutes acceptance of the revised policy.',
      ],
    },
    {
      heading: '13. Contact',
      paragraphs: [
        'For privacy-related questions, please use our contact form (uhrate.online/contact).',
      ],
    },
  ],
};
