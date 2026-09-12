'use client';

import Link from 'next/link';
import { SUPPORTED_CHAINS, PLATFORM_FEE_USD } from '@/lib/registry';

export default function PricingPage() {
  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <div className="border-b border-gray-100 px-6 py-4 flex items-center justify-between">
        <Link href="/" className="font-bold text-xl text-gray-900">UHRATE</Link>
        <div className="flex gap-3">
          <Link href="/login" className="px-4 py-2 text-sm text-gray-600 hover:text-gray-900">Login</Link>
          <Link href="/register" className="px-4 py-2 bg-black text-white text-sm rounded-xl hover:bg-gray-800 transition-colors">Get Started Free</Link>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-6 py-20">
        {/* Hero */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-green-50 border border-green-200 rounded-full text-green-700 text-sm font-medium mb-6">
            ✓ Free to use — only pay when you go on-chain
          </div>
          <h1 className="text-5xl font-black text-gray-900 mb-4 tracking-tight">
            Simple, honest pricing.
          </h1>
          <p className="text-xl text-gray-500 max-w-2xl mx-auto">
            UHRATE is completely free. The only fee is a small <strong className="text-gray-900">${PLATFORM_FEE_USD} platform fee</strong> when you deploy a document to the blockchain for permanent on-chain identity.
          </p>
        </div>

        {/* Main pricing card */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-16">
          {/* Free tier */}
          <div className="border border-gray-200 rounded-2xl p-8">
            <div className="mb-6">
              <p className="text-sm font-semibold text-gray-500 uppercase tracking-widest mb-2">Standard</p>
              <div className="flex items-end gap-2 mb-3">
                <span className="text-5xl font-black text-gray-900">$0</span>
                <span className="text-gray-400 mb-2">forever</span>
              </div>
              <p className="text-gray-500 text-sm">Full access to everything UHRATE offers. No credit card required.</p>
            </div>
            <ul className="space-y-3 mb-8">
              {[
                'AI document verification (unlimited)',
                'Originality & deepfake scoring',
                'Digital DNA fingerprinting',
                'Document Registry access',
                'Education credential registry',
                'Legal document registry',
                'Media & IP registry',
                'Identity badge application',
                'Certificate download',
                'Share verification results',
                'Developer API access',
                'Dashboard & history',
              ].map(f => (
                <li key={f} className="flex items-start gap-3 text-sm text-gray-700">
                  <span className="text-green-500 font-bold flex-shrink-0">✓</span>
                  {f}
                </li>
              ))}
            </ul>
            <Link href="/register" className="block w-full py-3 border border-gray-200 text-gray-700 rounded-xl text-sm font-semibold text-center hover:bg-gray-50 transition-colors">
              Get Started Free →
            </Link>
          </div>

          {/* Blockchain fee */}
          <div className="border-2 border-black rounded-2xl p-8 relative">
            <div className="absolute -top-3 left-6">
              <span className="bg-black text-white text-xs font-bold px-3 py-1 rounded-full">BLOCKCHAIN IDENTITY</span>
            </div>
            <div className="mb-6">
              <p className="text-sm font-semibold text-gray-500 uppercase tracking-widest mb-2">On-Chain Deployment</p>
              <div className="flex items-end gap-2 mb-3">
                <span className="text-5xl font-black text-gray-900">$0.50</span>
                <span className="text-gray-400 mb-2">per document</span>
              </div>
              <p className="text-gray-500 text-sm">One-time platform fee included when deploying your document to the blockchain. Gas fees are separate and paid by your wallet.</p>
            </div>
            <ul className="space-y-3 mb-8">
              {[
                'Everything in Standard (free)',
                'Permanent on-chain document identity',
                'Immutable blockchain timestamp',
                'NFT certificate minting',
                'Multi-chain deployment (ETH, BNB, Base, Polygon)',
                'IPFS decentralized storage',
                'Blockchain transaction proof',
                'Verifiable by anyone forever',
                '$0.50 platform fee + gas fees',
              ].map(f => (
                <li key={f} className="flex items-start gap-3 text-sm text-gray-700">
                  <span className="text-black font-bold flex-shrink-0">✓</span>
                  {f}
                </li>
              ))}
            </ul>
            <Link href="/register" className="block w-full py-3 bg-black text-white rounded-xl text-sm font-semibold text-center hover:bg-gray-800 transition-colors">
              Deploy Your First Document →
            </Link>
          </div>
        </div>

        {/* Supported Networks */}
        <div className="mb-16">
          <h2 className="text-2xl font-black text-gray-900 mb-2 text-center">Supported Networks</h2>
          <p className="text-gray-500 text-center mb-8">Choose any EVM-compatible network for your document deployment</p>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {SUPPORTED_CHAINS.map(chain => (
              <div key={chain.id} className="border border-gray-100 rounded-2xl p-5 text-center hover:border-gray-300 transition-colors">
                <div className="text-3xl mb-3">{chain.icon}</div>
                <p className="font-bold text-gray-900 text-sm mb-1">{chain.name}</p>
                <p className="text-xs text-gray-400 mb-2">{chain.symbol}</p>
                <span className="text-xs text-green-600 font-medium bg-green-50 px-2 py-0.5 rounded-full">
                  Gas {chain.gasEstimate}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* FAQ */}
        <div className="mb-16">
          <h2 className="text-2xl font-black text-gray-900 mb-8 text-center">Frequently Asked Questions</h2>
          <div className="space-y-4">
            {[
              {
                q: 'Why is UHRATE free?',
                a: 'Our goal is to build the largest database of verified authentic documents on the blockchain. We want as many users as possible using the platform. The $0.50 fee only applies when you deploy to blockchain — all AI verification, scoring, and certificates are completely free.',
              },
              {
                q: 'What is the $0.50 platform fee for?',
                a: 'The $0.50 is a one-time platform fee collected when you deploy a document to the blockchain for permanent identity. This is separate from gas fees which go directly to the network validators. The platform fee covers our infrastructure, IPFS storage, and NFT certificate generation.',
              },
              {
                q: 'Do I have to deploy to blockchain?',
                a: 'No. You can use UHRATE\'s AI verification, scoring, and certificates completely free without ever deploying to blockchain. Blockchain deployment is optional — it gives your document a permanent, immutable on-chain identity that anyone can verify forever.',
              },
              {
                q: 'Which blockchain should I choose?',
                a: 'For lowest fees, use Base or Polygon (under $0.05 in gas). For maximum security and recognition, use Ethereum. BNB Chain offers a good balance of low fees and wide adoption. The $0.50 platform fee is the same regardless of which chain you choose.',
              },
              {
                q: 'Can anyone verify my document?',
                a: 'Yes. Once deployed on-chain, anyone can verify your document\'s authenticity using the transaction hash or certificate ID — without needing an account or paying any fee.',
              },
              {
                q: 'Will there ever be subscription plans?',
                a: 'No. UHRATE is committed to remaining free for all users. The only charge is the $0.50 blockchain deployment fee, which only applies when you choose to give a document permanent on-chain identity.',
              },
            ].map((faq, i) => (
              <div key={i} className="border border-gray-100 rounded-2xl p-6">
                <p className="font-bold text-gray-900 mb-2">{faq.q}</p>
                <p className="text-gray-500 text-sm leading-relaxed">{faq.a}</p>
              </div>
            ))}
          </div>
        </div>

        {/* CTA */}
        <div className="bg-black rounded-3xl p-12 text-center">
          <h2 className="text-3xl font-black text-white mb-3">Start verifying for free.</h2>
          <p className="text-gray-400 mb-8 max-w-xl mx-auto">Join thousands of users protecting their documents, credentials, and creative work with UHRATE.</p>
          <div className="flex gap-4 justify-center flex-wrap">
            <Link href="/register" className="px-8 py-4 bg-white text-black rounded-2xl text-sm font-bold hover:bg-gray-100 transition-colors">
              Create Free Account →
            </Link>
            <Link href="/verify" className="px-8 py-4 border border-white/20 text-white rounded-2xl text-sm font-semibold hover:bg-white/10 transition-colors">
              Try Verification
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}