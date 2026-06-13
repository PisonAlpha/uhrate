'use client';
export default function Terms() {
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
          <span className="text-sm text-gray-500 font-medium">Terms of Service</span>
        </div>
      </header>

      <div className="max-w-3xl mx-auto px-4 sm:px-6 py-12">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Terms of Service</h1>
        <p className="text-sm text-gray-400 mb-8">Last updated: June 2026</p>

        <div className="bg-white border border-gray-200 rounded-2xl p-6 sm:p-8 space-y-6 text-sm text-gray-700 leading-relaxed">
          <section>
            <h2 className="font-semibold text-gray-900 text-base mb-2">1. Acceptance of Terms</h2>
            <p>By accessing or using UHRATE ("the Service"), available at uhrate.xyz, you agree to be bound by these Terms of Service. If you do not agree, do not use the Service.</p>
          </section>

          <section>
            <h2 className="font-semibold text-gray-900 text-base mb-2">2. Description of Service</h2>
            <p>UHRATE provides AI-powered analysis of digital files (images, video, audio, documents) to assess originality, AI-generation likelihood, and potential manipulation. The Service also allows users to register cryptographic fingerprints of files and records on public blockchains (including BNB Smart Chain) and to mint non-fungible tokens (NFTs) representing verification certificates.</p>
          </section>

          <section>
            <h2 className="font-semibold text-gray-900 text-base mb-2">3. No Warranty on Analysis Results</h2>
            <p>UHRATE's authenticity scores, ratings, and AI analysis are provided "as is" and represent automated assessments only. They are not guarantees of authenticity, originality, or legal validity. UHRATE makes no warranty, express or implied, regarding the accuracy of any analysis. Users should not rely solely on UHRATE results for legal, financial, academic, or other consequential decisions.</p>
          </section>

          <section>
            <h2 className="font-semibold text-gray-900 text-base mb-2">4. Blockchain Transactions and Gas Fees</h2>
            <p>Certain features (NFT minting, document/credential registration) require users to connect a third-party cryptocurrency wallet (e.g. MetaMask) and pay network gas fees directly from their own wallet. UHRATE does not control blockchain networks, gas prices, or transaction confirmation times, and is not responsible for failed, delayed, or reverted transactions, lost funds due to user error, or wallet security.</p>
            <p className="mt-2">All blockchain transactions are permanent and irreversible. Users are solely responsible for the accuracy of information submitted for on-chain registration.</p>
          </section>

          <section>
            <h2 className="font-semibold text-gray-900 text-base mb-2">5. Accounts and Credits</h2>
            <p>Free accounts receive a limited number of verification credits per month. Paid plans (Pro, Enterprise) are billed via cryptocurrency payment (USDT BEP20 or BNB) on a monthly basis. Plans automatically expire one month after activation unless renewed, after which the account reverts to the free tier.</p>
          </section>

          <section>
            <h2 className="font-semibold text-gray-900 text-base mb-2">6. Payments</h2>
            <p>All payments are made on-chain in cryptocurrency and are non-refundable. UHRATE is not responsible for payments sent to incorrect addresses, sent on the wrong network, or sent in incorrect amounts. It is the user's responsibility to verify wallet addresses and amounts before sending payment.</p>
          </section>

          <section>
            <h2 className="font-semibold text-gray-900 text-base mb-2">7. User Content and Conduct</h2>
            <p>You retain ownership of files you upload. By uploading content, you represent that you have the right to do so and that the content does not violate any law or third party's rights. You agree not to use the Service to register false, fraudulent, or misleading information on the blockchain, including impersonating others or misrepresenting ownership of documents, credentials, or media.</p>
          </section>

          <section>
            <h2 className="font-semibold text-gray-900 text-base mb-2">8. Identity Badges</h2>
            <p>Identity verification badges are granted at UHRATE's sole discretion based on information and documentation provided by the applicant. A badge does not constitute a legal certification of identity and may be revoked at any time.</p>
          </section>

          <section>
            <h2 className="font-semibold text-gray-900 text-base mb-2">9. API Usage</h2>
            <p>API keys are issued per account and subject to the rate limits of the associated plan. Misuse, including attempts to circumvent rate limits or share keys across unrelated accounts, may result in suspension.</p>
          </section>

          <section>
            <h2 className="font-semibold text-gray-900 text-base mb-2">10. Limitation of Liability</h2>
            <p>To the maximum extent permitted by law, UHRATE and its operators shall not be liable for any indirect, incidental, special, consequential, or punitive damages, including loss of funds, data, or business opportunities, arising from your use of the Service.</p>
          </section>

          <section>
            <h2 className="font-semibold text-gray-900 text-base mb-2">11. Changes to These Terms</h2>
            <p>UHRATE may update these Terms from time to time. Continued use of the Service after changes constitutes acceptance of the revised Terms.</p>
          </section>

          <section>
            <h2 className="font-semibold text-gray-900 text-base mb-2">12. Contact</h2>
            <p>Questions about these Terms can be sent via our <span className="text-blue-600">contact form (uhrate.xyz/contact)</span>.</p>
          </section>
        </div>
      </div>
    </main>
  );
}