'use client';
export default function Privacy() {
  return (
    <main className="min-h-screen bg-gray-50">
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 py-4 flex items-center justify-between">
          <button onClick={() => window.location.href = '/'} className="flex items-center gap-3 bg-transparent border-0 cursor-pointer p-0">
            <div className="w-8 h-8 bg-black rounded-lg flex items-center justify-center">
              <span className="text-white text-xs font-bold">UH</span>
            </div>
            <span className="font-semibold text-gray-900">UHRATE</span>
          </button>
          <span className="text-sm text-gray-500 font-medium">Privacy Policy</span>
        </div>
      </header>

      <div className="max-w-3xl mx-auto px-4 sm:px-6 py-12">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Privacy Policy</h1>
        <p className="text-sm text-gray-400 mb-8">Last updated: June 2026</p>

        <div className="bg-white border border-gray-200 rounded-2xl p-6 sm:p-8 space-y-6 text-sm text-gray-700 leading-relaxed">
          <section>
            <h2 className="font-semibold text-gray-900 text-base mb-2">1. Information We Collect</h2>
            <p>When you create an account, we collect your name, email address, and a hashed password. When you verify files, we process the file content temporarily for analysis and store the resulting cryptographic fingerprints (SHA-256, perceptual hashes), AI analysis scores, and certificate metadata.</p>
            <p className="mt-2">When you connect a cryptocurrency wallet (e.g., MetaMask), we may record the public wallet address and transaction hashes associated with your actions (NFT minting, document registration, payments). We never have access to your private keys.</p>
          </section>

          <section>
            <h2 className="font-semibold text-gray-900 text-base mb-2">2. How We Use Your Information</h2>
            <p>We use collected information to: provide verification results, maintain your account and verification history (Dashboard), track free-tier usage credits, send transactional emails (verification completed, welcome emails), process plan upgrades, and respond to support/contact inquiries.</p>
          </section>

          <section>
            <h2 className="font-semibold text-gray-900 text-base mb-2">3. AI Processing of Uploaded Content</h2>
            <p>Uploaded files (or relevant excerpts/images) may be sent to third-party AI providers (such as Anthropic's Claude API) for analysis purposes. This content is processed to generate authenticity scores and is not used by UHRATE to train AI models. Refer to the relevant AI provider's policies for how they handle data sent via API.</p>
          </section>

          <section>
            <h2 className="font-semibold text-gray-900 text-base mb-2">4. Blockchain and Public Data</h2>
            <p>Information you choose to register on a blockchain (document hashes, registry metadata, NFT certificates) becomes permanently public and immutable on that blockchain. This data cannot be deleted or modified by UHRATE once submitted. Do not register sensitive personal information on-chain that you do not want to be publicly visible forever.</p>
          </section>

          <section>
            <h2 className="font-semibold text-gray-900 text-base mb-2">5. Decentralized Storage (IPFS)</h2>
            <p>Certificate data may be uploaded to IPFS (via Pinata) for decentralized storage. Content pinned to IPFS may be accessible by anyone with the corresponding hash and may persist on the network independently of UHRATE.</p>
          </section>

          <section>
            <h2 className="font-semibold text-gray-900 text-base mb-2">6. Data Storage and Security</h2>
            <p>Account and verification data is stored in our database (Supabase) with access controls. While we take reasonable measures to protect your data, no system is completely secure, and we cannot guarantee absolute security.</p>
          </section>

          <section>
            <h2 className="font-semibold text-gray-900 text-base mb-2">7. Third-Party Services</h2>
            <p>We use third-party services including Supabase (database), Anthropic (AI analysis), Resend (email delivery), Pinata (IPFS storage), and public blockchain networks (BNB Smart Chain and others). These providers may process your data according to their own privacy policies.</p>
          </section>

          <section>
            <h2 className="font-semibold text-gray-900 text-base mb-2">8. Data Retention</h2>
            <p>We retain account and verification records for as long as your account is active. Data registered on a blockchain or IPFS cannot be retained or deleted on a fixed schedule, as it is permanent by design once submitted.</p>
          </section>

          <section>
            <h2 className="font-semibold text-gray-900 text-base mb-2">9. Your Rights</h2>
            <p>You may request access to, correction of, or deletion of your account data (excluding immutable on-chain or IPFS records, which cannot be altered) by contacting us through our <span className="text-blue-600">contact form (uhrate.xyz/contact)</span>.</p>
          </section>

          <section>
            <h2 className="font-semibold text-gray-900 text-base mb-2">10. Cookies</h2>
            <p>We use minimal local storage in your browser to keep you logged in and remember preferences. We do not use third-party advertising trackers.</p>
          </section>

          <section>
            <h2 className="font-semibold text-gray-900 text-base mb-2">11. Children's Privacy</h2>
            <p>UHRATE is not directed at children under 13, and we do not knowingly collect personal information from children under 13.</p>
          </section>

          <section>
            <h2 className="font-semibold text-gray-900 text-base mb-2">12. Changes to This Policy</h2>
            <p>We may update this Privacy Policy from time to time. Continued use of the Service after changes constitutes acceptance of the revised policy.</p>
          </section>

          <section>
            <h2 className="font-semibold text-gray-900 text-base mb-2">13. Contact</h2>
            <p>For privacy-related questions, please use our <span className="text-blue-600">contact form (uhrate.xyz/contact)</span>.</p>
          </section>
        </div>
      </div>
    </main>
  );
}