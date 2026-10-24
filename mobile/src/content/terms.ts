import type { Policy } from './types';

// Copied from the website's /terms page (app/terms/page.tsx). Keep in step with it.
export const termsPolicy: Policy = {
  title: 'Terms of Service',
  updated: 'June 2026',
  sections: [
    {
      heading: '1. Acceptance of Terms',
      paragraphs: [
        'By accessing or using UHRATE ("the Service"), available at uhrate.online, you agree to be bound by these Terms of Service. If you do not agree, do not use the Service.',
      ],
    },
    {
      heading: '2. Description of Service',
      paragraphs: [
        'UHRATE provides AI-powered analysis of digital files (images, video, audio, documents) to assess originality, AI-generation likelihood, and potential manipulation. The Service also allows users to register cryptographic fingerprints of files and records on public blockchains (including BNB Smart Chain) and to mint non-fungible tokens (NFTs) representing verification certificates.',
      ],
    },
    {
      heading: '3. No Warranty on Analysis Results',
      paragraphs: [
        'UHRATE\'s authenticity scores, ratings, and AI analysis are provided "as is" and represent automated assessments only. They are not guarantees of authenticity, originality, or legal validity. UHRATE makes no warranty, express or implied, regarding the accuracy of any analysis. Users should not rely solely on UHRATE results for legal, financial, academic, or other consequential decisions.',
      ],
    },
    {
      heading: '4. Blockchain Transactions and Gas Fees',
      paragraphs: [
        'Certain features (NFT minting, document/credential registration) require users to connect a third-party cryptocurrency wallet (e.g. MetaMask) and pay network gas fees directly from their own wallet. UHRATE does not control blockchain networks, gas prices, or transaction confirmation times, and is not responsible for failed, delayed, or reverted transactions, lost funds due to user error, or wallet security.',
        'All blockchain transactions are permanent and irreversible. Users are solely responsible for the accuracy of information submitted for on-chain registration.',
      ],
    },
    {
      heading: '5. Accounts and Credits',
      paragraphs: [
        'Free accounts receive a limited number of verification credits per month. Paid plans (Pro, Enterprise) are billed via cryptocurrency payment (USDT BEP20 or BNB) on a monthly basis. Plans automatically expire one month after activation unless renewed, after which the account reverts to the free tier.',
      ],
    },
    {
      heading: '6. Payments',
      paragraphs: [
        "All payments are made on-chain in cryptocurrency and are non-refundable. UHRATE is not responsible for payments sent to incorrect addresses, sent on the wrong network, or sent in incorrect amounts. It is the user's responsibility to verify wallet addresses and amounts before sending payment.",
      ],
    },
    {
      heading: '7. User Content and Conduct',
      paragraphs: [
        "You retain ownership of files you upload. By uploading content, you represent that you have the right to do so and that the content does not violate any law or third party's rights. You agree not to use the Service to register false, fraudulent, or misleading information on the blockchain, including impersonating others or misrepresenting ownership of documents, credentials, or media.",
      ],
    },
    {
      heading: '8. Identity Badges',
      paragraphs: [
        "Identity verification badges are granted at UHRATE's sole discretion based on information and documentation provided by the applicant. A badge does not constitute a legal certification of identity and may be revoked at any time.",
      ],
    },
    {
      heading: '9. API Usage',
      paragraphs: [
        'API keys are issued per account and subject to the rate limits of the associated plan. Misuse, including attempts to circumvent rate limits or share keys across unrelated accounts, may result in suspension.',
      ],
    },
    {
      heading: '10. Limitation of Liability',
      paragraphs: [
        'To the maximum extent permitted by law, UHRATE and its operators shall not be liable for any indirect, incidental, special, consequential, or punitive damages, including loss of funds, data, or business opportunities, arising from your use of the Service.',
      ],
    },
    {
      heading: '11. Changes to These Terms',
      paragraphs: [
        'UHRATE may update these Terms from time to time. Continued use of the Service after changes constitutes acceptance of the revised Terms.',
      ],
    },
    {
      heading: '12. Contact',
      paragraphs: [
        'Questions about these Terms can be sent via our contact form (uhrate.online/contact).',
      ],
    },
  ],
};
