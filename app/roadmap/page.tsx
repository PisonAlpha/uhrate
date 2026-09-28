'use client';

import Nav from '../components/Nav';
import Footer from '../components/Footer';

export default function Roadmap() {
  const quarters = [
    {
      period: 'Q3 2026',
      status: 'completed',
      title: 'Foundation',
      items: [
        { done: true, text: 'UHRATE platform deployed live at uhrate.online' },
        { done: true, text: 'UHR token deployed on BNB Smart Chain (BEP20)' },
        { done: true, text: 'Smart contracts verified on BSCScan' },
        { done: true, text: 'AI-powered Verify (deepfake detection) launched — free' },
        { done: true, text: 'Seal page — permanent blockchain file identity' },
        { done: true, text: 'Lookup page — certificate ID and hash-based search' },
        { done: true, text: 'Document, Education, Legal, and Media registries live' },
        { done: true, text: 'IQ.wiki listing secured' },
        { done: true, text: 'Angel Round closed — $800,000 raised by Harfinance at $0.0099/UHR' },
        { done: true, text: '1,030+ files sealed on multiple blockchains' },
        { done: true, text: 'Investor dashboard launched at uhrate.online/investors' },
        { done: true, text: 'Public analytics page at uhrate.online/analytics' },
      ],
    },
    {
      period: 'Q4 2026',
      status: 'active',
      title: 'Token Launch & CEX Listing',
      items: [
        { done: true,  text: 'Presale live at $0.01/UHR — smart contract on BNB Chain' },
        { done: true,  text: 'Sealed file download — UHRATE identity embedded in file' },
        { done: true,  text: 'Android mobile app (beta)' },
        { done: false, text: 'Complete presale (80,000,000 UHR at $0.01)' },
        { done: false, text: 'CEX listing on Bitget at $0.02/UHR' },
        { done: false, text: 'CEX listing on Gate.com at $0.02/UHR' },
        { done: false, text: 'PancakeSwap DEX liquidity provision' },
        { done: false, text: 'Android app on Google Play Store' },
        { done: false, text: 'CoinGecko and CoinMarketCap token submissions' },
        { done: false, text: 'Smart contract security audit completion' },
        { done: false, text: 'UHR token airdrop for early platform users' },
      ],
    },
    {
      period: 'Q1 2027',
      status: 'upcoming',
      title: 'Platform Growth',
      items: [
        { done: false, text: 'Staking platform launch — 10%, 15%, 20% APY pools' },
        { done: false, text: 'Enterprise API launch with tiered subscription plans' },
        { done: false, text: 'iOS mobile app launch on App Store' },
        { done: false, text: 'Bulk document verification for enterprises' },
        { done: false, text: 'First quarterly UHR buyback and burn' },
        { done: false, text: 'Developer API marketplace with API key management' },
        { done: false, text: 'Additional blockchain network integrations' },
        { done: false, text: 'Education and legal sector partnership announcements' },
      ],
    },
    {
      period: 'Q2 2027',
      status: 'upcoming',
      title: 'Ecosystem Expansion',
      items: [
        { done: false, text: 'DAO launch — full community governance voting' },
        { done: false, text: 'Treasury transferred to DAO smart contract' },
        { done: false, text: 'White-label API for institutional partners' },
        { done: false, text: 'UHRATE identity embedded in major document platforms' },
        { done: false, text: 'Cross-chain bridge for UHR token' },
        { done: false, text: 'Media and journalism partnership program' },
        { done: false, text: 'Government and legal sector pilot programs' },
        { done: false, text: 'Target: 10,000+ files sealed per month' },
      ],
    },
    {
      period: 'Q3–Q4 2027',
      status: 'upcoming',
      title: 'Scale & Decentralize',
      items: [
        { done: false, text: 'Tier-1 CEX expansion beyond Bitget and Gate.com' },
        { done: false, text: 'University credential verification partnerships' },
        { done: false, text: 'UHRATE API integration in major HR platforms' },
        { done: false, text: 'Decentralized identity (DID) standard integration' },
        { done: false, text: 'NFT certificate minting for sealed documents' },
        { done: false, text: 'UHRATE DAO fully operational — community-led development' },
        { done: false, text: 'Target: 100,000+ files sealed total' },
        { done: false, text: 'Full deflationary flywheel operational' },
      ],
    },
  ];

  return (
    <main className="min-h-screen bg-white">
      <Nav />

      {/* Hero */}
      <section className="bg-black text-white py-20 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/10 rounded-full text-sm mb-6">
            <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
            <span className="text-gray-300">Q4 2026 — Presale Live</span>
          </div>
          <h1 className="text-4xl sm:text-5xl font-black mb-4">UHRATE Roadmap</h1>
          <p className="text-gray-400 text-lg max-w-2xl mx-auto">
            From the first file sealed to a fully decentralized document identity network — here is where we are and where we are going.
          </p>
        </div>
      </section>

      {/* Progress Stats */}
      <section className="py-12 px-4 bg-gray-50 border-b border-gray-200">
        <div className="max-w-4xl mx-auto grid grid-cols-2 sm:grid-cols-4 gap-4">
          {[
            { label: 'Files Sealed', value: '1,030+', icon: 'seal' },
            { label: 'Angel Round Raised', value: '$800K', icon: 'raised' },
            { label: 'Blockchains Supported', value: '4', icon: 'chains' },
            { label: 'Presale Price', value: '$0.01', icon: 'price' },
          ].map(s => (
            <div key={s.label} className="bg-white border border-gray-200 rounded-2xl p-5 text-center">
              <p className="text-2xl font-black text-gray-900">{s.value}</p>
              <p className="text-xs text-gray-500 mt-1">{s.label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Timeline */}
      <section className="py-20 px-4">
        <div className="max-w-4xl mx-auto">
          <div className="space-y-8">
            {quarters.map((q, qi) => (
              <div key={q.period} className="relative">
                {/* Period header */}
                <div className={"flex items-center gap-4 mb-4"}>
                  <div className={"flex-shrink-0 w-28 px-3 py-1.5 rounded-full text-center text-xs font-bold " + (
                    q.status === 'completed' ? 'bg-green-500 text-white' :
                    q.status === 'active' ? 'bg-black text-white' :
                    'bg-gray-200 text-gray-600'
                  )}>
                    {q.period}
                  </div>
                  <div className="flex items-center gap-2">
                    <h2 className="text-xl font-black text-gray-900">{q.title}</h2>
                    {q.status === 'completed' && <span className="px-2 py-0.5 bg-green-100 text-green-700 text-xs font-bold rounded-full">Completed</span>}
                    {q.status === 'active' && <span className="px-2 py-0.5 bg-black text-white text-xs font-bold rounded-full animate-pulse">Active</span>}
                    {q.status === 'upcoming' && <span className="px-2 py-0.5 bg-gray-100 text-gray-500 text-xs font-bold rounded-full">Upcoming</span>}
                  </div>
                </div>

                {/* Items */}
                <div className={"ml-0 sm:ml-32 border rounded-2xl p-6 " + (
                  q.status === 'completed' ? 'border-green-200 bg-green-50' :
                  q.status === 'active' ? 'border-black bg-white shadow-lg' :
                  'border-gray-200 bg-white'
                )}>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {q.items.map((item, ii) => (
                      <div key={ii} className="flex items-start gap-2.5">
                        <div className={"flex-shrink-0 w-4 h-4 rounded-full mt-0.5 flex items-center justify-center text-xs " + (
                          item.done ? 'bg-green-500' : q.status === 'active' ? 'bg-gray-200' : 'bg-gray-100'
                        )}>
                          {item.done && <span className="text-white text-xs">✓</span>}
                        </div>
                        <p className={"text-sm " + (item.done ? 'text-gray-700' : 'text-gray-400')}>{item.text}</p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Connector line */}
                {qi < quarters.length - 1 && (
                  <div className="absolute left-14 top-full w-0.5 h-8 bg-gray-200" />
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="bg-black text-white py-16 px-4">
        <div className="max-w-2xl mx-auto text-center">
          <h2 className="text-3xl font-black mb-4">Join UHRATE Early</h2>
          <p className="text-gray-400 mb-8">The presale is live at $0.01/UHR — half the listing price. Be part of the journey from the start.</p>
          <div className="flex gap-3 justify-center flex-wrap">
            <button onClick={() => window.location.href = '/presale'} className="px-8 py-3 bg-red-500 text-white rounded-xl text-sm font-bold hover:bg-red-600 transition-colors">
              Join Presale — $0.01/UHR
            </button>
            <button onClick={() => window.location.href = '/tokenomics'} className="px-8 py-3 bg-white/10 text-white rounded-xl text-sm font-semibold hover:bg-white/20 transition-colors">
              View Tokenomics
            </button>
            <button onClick={() => window.location.href = '/investors'} className="px-8 py-3 bg-white/10 text-white rounded-xl text-sm font-semibold hover:bg-white/20 transition-colors">
              Investor Dashboard
            </button>
          </div>
        </div>
      </section>

      <Footer />
    </main>
  );
}
