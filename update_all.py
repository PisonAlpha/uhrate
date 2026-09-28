import re

# ── Fix 1: Update tokenomics allocation array ──
tok = open('app/tokenomics/page.tsx', 'r', encoding='utf-8').read()

old_alloc = """  const allocation = [
    { category: 'Community & Ecosystem', percent: 23.92, tokens: '239,191,919', vesting: 'Linear over 48 months from TGE', color: 'bg-blue-500' },
    { category: 'Platform Rewards & Staking', percent: 20, tokens: '200,000,000', vesting: 'Starts post-TGE, monthly unlock over 36 months', color: 'bg-purple-500' },
    { category: 'Angel Round', percent: 8.08, tokens: '80,808,081', vesting: '6-month cliff, linear over 18 months', color: 'bg-orange-500' },
    { category: 'Treasury & Reserve', percent: 10, tokens: '100,000,000', vesting: '24-month lock, DAO controlled release', color: 'bg-amber-500' },
    { category: 'Presale', percent: 8, tokens: '80,000,000', vesting: '6-month cliff, linear over 18 months', color: 'bg-red-500' },
    { category: 'Team & Founders', percent: 12, tokens: '120,000,000', vesting: '12-month cliff, linear over 36 months', color: 'bg-gray-700' },
    { category: 'Public Sale', percent: 7, tokens: '70,000,000', vesting: '20% at TGE, 80% linear over 12 months', color: 'bg-green-500' },
    { category: 'Liquidity', percent: 6, tokens: '60,000,000', vesting: '50% at TGE, 50% over 6 months', color: 'bg-cyan-500' },
    { category: 'Advisors & Partners', percent: 5, tokens: '50,000,000', vesting: '6-month cliff, linear over 24 months', color: 'bg-pink-500' },
  ];"""

new_alloc = """  const allocation = [
    { category: 'Community & Ecosystem', percent: 23.92, tokens: '239,191,919', vesting: '17.6% at TGE, linear over 48 months', tge: '42,097,778', cliff: '0 months', color: 'bg-blue-500' },
    { category: 'Platform Rewards & Staking', percent: 20, tokens: '200,000,000', vesting: '0% at TGE, monthly unlock over 36 months post-TGE', tge: '0', cliff: '0 months', color: 'bg-purple-500' },
    { category: 'Angel Round', percent: 8.08, tokens: '80,808,081', vesting: '0% at TGE, 6-month cliff, linear over 18 months', tge: '0', cliff: '6 months', color: 'bg-orange-500' },
    { category: 'Treasury & Reserve', percent: 10, tokens: '100,000,000', vesting: '0% at TGE, 24-month lock, DAO controlled release', tge: '0', cliff: '24 months', color: 'bg-amber-500' },
    { category: 'Presale', percent: 8, tokens: '80,000,000', vesting: '0% at TGE, 6-month cliff, linear over 18 months', tge: '0', cliff: '6 months', color: 'bg-red-500' },
    { category: 'Team & Founders', percent: 12, tokens: '120,000,000', vesting: '0% at TGE, 12-month cliff, linear over 36 months', tge: '0', cliff: '12 months', color: 'bg-gray-700' },
    { category: 'Public Sale', percent: 7, tokens: '70,000,000', vesting: '20% at TGE, linear over 12 months', tge: '14,000,000', cliff: '0 months', color: 'bg-green-500' },
    { category: 'Liquidity', percent: 6, tokens: '60,000,000', vesting: '50% at TGE, 50% over 6 months', tge: '30,000,000', cliff: '0 months', color: 'bg-cyan-500' },
    { category: 'Advisors & Partners', percent: 5, tokens: '50,000,000', vesting: '0% at TGE, 6-month cliff, linear over 24 months', tge: '0', cliff: '6 months', color: 'bg-pink-500' },
  ];"""

tok = tok.replace(old_alloc, new_alloc)

# Update phases array
old_phases = """  const phases = [
    { phase: '01', title: 'Token Launch', desc: 'UHR token deployed on BNB Smart Chain. Tokenomics and whitepaper published.', active: true },
    { phase: '02', title: 'Presale', desc: 'Early supporters acquire UHR at presale pricing of $0.01 per token. Limited to 80,000,000 UHR.', active: true },
    { phase: '03', title: 'Public Sale', desc: 'Community sale via launchpad. UHRATE platform users get priority whitelist access.', active: false },
    { phase: '04', title: 'DEX Listing', desc: 'Initial listing on PancakeSwap. Liquidity provided from treasury. CEX applications begin.', active: false },
    { phase: '05', title: 'Staking Launch', desc: 'Deploy staking platform. Enable UHR deployment fee discounts. Begin fee burn mechanism.', active: false },
    { phase: '06', title: 'DAO Launch', desc: 'Transfer treasury to DAO smart contract. Enable full community governance voting.', active: false },
  ];"""

new_phases = """  const phases = [
    { phase: '01', title: 'Token Launch', desc: 'UHR token deployed on BNB Smart Chain. Smart contracts verified on BSCScan. Tokenomics published.', active: true, date: 'Q3 2026' },
    { phase: '02', title: 'Angel Round', desc: 'Angel Round closed at $0.0099/UHR. $800,000 raised. Lead investor: Harfinance.', active: true, date: 'Sep 2026' },
    { phase: '03', title: 'Presale — LIVE', desc: 'Public presale at $0.01/UHR. 80,000,000 UHR available. Smart contract on BNB Chain. 1,030+ files sealed on platform.', active: true, date: 'Sep 2026' },
    { phase: '04', title: 'CEX Listing', desc: 'Listing on Bitget and Gate.com at $0.02/UHR. PancakeSwap DEX liquidity provision. CoinGecko and CoinMarketCap submissions.', active: false, date: 'Q4 2026' },
    { phase: '05', title: 'Mobile App Launch', desc: 'Android app on Google Play Store. iOS app development begins. In-app file sealing and verification.', active: false, date: 'Q4 2026' },
    { phase: '06', title: 'Staking Launch', desc: 'Deploy staking platform. Flexible 10% APY, 30-day 15% APY, 90-day 20% APY. Begin fee burn mechanism.', active: false, date: 'Q1 2027' },
    { phase: '07', title: 'Enterprise API', desc: 'Launch tiered enterprise API plans. Bulk document verification. White-label integration for businesses.', active: false, date: 'Q1 2027' },
    { phase: '08', title: 'DAO Launch', desc: 'Transfer treasury to DAO smart contract. Enable full community governance. Quarterly buyback and burn begins.', active: false, date: 'Q2 2027' },
  ];"""

tok = tok.replace(old_phases, new_phases)

# Update allocation render to show TGE and cliff
old_render = """              {allocation.map(item => (
                <div key={item.category} className={"bg-white border rounded-xl p-4 " + (item.category === 'Presale' ? 'border-red-300 bg-red-50' : 'border-gray-200')}>
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-3">"""

new_render = """              {allocation.map(item => (
                <div key={item.category} className={"bg-white border rounded-xl p-4 " + (item.category === 'Presale' ? 'border-red-300 bg-red-50' : item.category === 'Angel Round' ? 'border-orange-300 bg-orange-50' : 'border-gray-200')}>
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-3">"""

tok = tok.replace(old_render, new_render)

# Find vesting display and add TGE unlock and cliff info
old_vesting_display = """                  <p className="text-xs text-gray-500">{item.vesting}</p>"""
new_vesting_display = """                  <p className="text-xs text-gray-500">{item.vesting}</p>
                  <div className="flex gap-3 mt-2">
                    <span className="text-xs px-2 py-0.5 bg-gray-100 rounded-full text-gray-600">TGE: {item.tge} UHR</span>
                    <span className="text-xs px-2 py-0.5 bg-gray-100 rounded-full text-gray-600">Cliff: {item.cliff}</span>
                  </div>"""

tok = tok.replace(old_vesting_display, new_vesting_display)

# Update phases render to show date
old_phase_render = """              <div key={item.phase} className={"flex gap-4 p-5 rounded-2xl border " + (item.active ? 'bg-black text-white border-black' : 'bg-white border-gray-200')}>
                <span className={"text-2xl font-bold font-mono flex-shrink-0 " + (item.active ? 'text-gray-400' : 'text-gray-300')}>
                  {item.phase}
                </span>
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className={"font-semibold " + (item.active ? 'text-white' : 'text-gray-900')}>{item.title}</h3>
                    {item.active && <span className="px-2 py-0.5 bg-green-500 text-white text-xs rounded-full font-medium">Active</span>}
                  </div>
                  <p className={"text-sm " + (item.active ? 'text-gray-400' : 'text-gray-500')}>{item.desc}</p>
                </div>
              </div>"""

new_phase_render = """              <div key={item.phase} className={"flex gap-4 p-5 rounded-2xl border " + (item.active ? 'bg-black text-white border-black' : 'bg-white border-gray-200')}>
                <span className={"text-2xl font-bold font-mono flex-shrink-0 " + (item.active ? 'text-gray-400' : 'text-gray-300')}>
                  {item.phase}
                </span>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1 flex-wrap">
                    <h3 className={"font-semibold " + (item.active ? 'text-white' : 'text-gray-900')}>{item.title}</h3>
                    {item.active && <span className="px-2 py-0.5 bg-green-500 text-white text-xs rounded-full font-medium">Active</span>}
                    <span className={"text-xs px-2 py-0.5 rounded-full " + (item.active ? 'bg-white/10 text-gray-300' : 'bg-gray-100 text-gray-500')}>{item.date}</span>
                  </div>
                  <p className={"text-sm " + (item.active ? 'text-gray-400' : 'text-gray-500')}>{item.desc}</p>
                </div>
              </div>"""

tok = tok.replace(old_phase_render, new_phase_render)

# Add TGE summary section before Token Allocation section
old_section = """      {/* Token Allocation */}
      <section className="py-20 px-4">"""

new_section = """      {/* TGE Summary */}
      <section className="py-16 px-4 bg-gray-50 border-b border-gray-200">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-10">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">TGE Circulating Supply</h2>
            <p className="text-gray-500">Initial circulating supply at Token Generation Event</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            {[
              { label: 'Public Sale (20% of 7%)', tokens: '14,000,000', pct: '1.4%', color: 'bg-green-500' },
              { label: 'Liquidity (50% of 6%)', tokens: '30,000,000', pct: '3.0%', color: 'bg-cyan-500' },
              { label: 'Community (17.6% of 23.92%)', tokens: '42,097,778', pct: '4.21%', color: 'bg-blue-500' },
              { label: 'All Others (cliff/locked)', tokens: '0', pct: '0%', color: 'bg-gray-300' },
            ].map(item => (
              <div key={item.label} className="bg-white border border-gray-200 rounded-2xl p-5 text-center">
                <div className={"w-3 h-3 rounded-full mx-auto mb-3 " + item.color} />
                <p className="text-xl font-black text-gray-900">{item.tokens}</p>
                <p className="text-sm font-bold text-gray-500">{item.pct} of supply</p>
                <p className="text-xs text-gray-400 mt-1">{item.label}</p>
              </div>
            ))}
          </div>
          <div className="bg-black text-white rounded-2xl p-6 text-center">
            <p className="text-gray-400 text-sm mb-2">Total TGE Circulating Supply</p>
            <p className="text-4xl font-black text-yellow-400">86,097,778 UHR</p>
            <p className="text-2xl font-bold text-white mt-1">8.61% of Total Supply</p>
            <p className="text-gray-400 text-sm mt-3">Angel Round, Presale, Team, Advisors, Treasury, and Platform Rewards are all locked at TGE</p>
          </div>

          {/* Investment Rounds */}
          <div className="mt-10">
            <h3 className="text-xl font-bold text-gray-900 mb-6 text-center">Investment Rounds</h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {[
                { round: 'Angel Round', price: '$0.0099', fdv: '$9.9M', raised: '$800,000', investor: 'Harfinance', status: 'CLOSED', color: 'bg-orange-500' },
                { round: 'Presale', price: '$0.01', fdv: '$10M', raised: '$124,500+', investor: 'Public', status: 'LIVE', color: 'bg-red-500' },
                { round: 'Public Sale / Listing', price: '$0.02', fdv: '$20M', raised: 'TBD', investor: 'CEX', status: 'Q4 2026', color: 'bg-green-500' },
              ].map(r => (
                <div key={r.round} className="bg-white border border-gray-200 rounded-2xl p-5">
                  <div className="flex items-center justify-between mb-3">
                    <p className="font-bold text-gray-900">{r.round}</p>
                    <span className={"px-2 py-0.5 text-white text-xs font-bold rounded-full " + r.color}>{r.status}</span>
                  </div>
                  <p className="text-3xl font-black text-gray-900 mb-3">{r.price}<span className="text-sm font-normal text-gray-500">/UHR</span></p>
                  <div className="space-y-1.5 text-sm">
                    <div className="flex justify-between"><span className="text-gray-500">FDV</span><span className="font-semibold">{r.fdv}</span></div>
                    <div className="flex justify-between"><span className="text-gray-500">Raised</span><span className="font-semibold">{r.raised}</span></div>
                    <div className="flex justify-between"><span className="text-gray-500">Investor</span><span className="font-semibold">{r.investor}</span></div>
                  </div>
                </div>
              ))}
            </div>
            <p className="text-center text-sm text-gray-400 mt-4">Angel Round ROI: 2.02x at listing | Presale ROI: 2.00x at listing</p>
          </div>
        </div>
      </section>

      {/* Token Allocation */}
      <section className="py-20 px-4">"""

tok = tok.replace(old_section, new_section)

open('app/tokenomics/page.tsx', 'w', encoding='utf-8').write(tok)
print('FIXED: tokenomics page')

# ── Fix 2: Create roadmap page ──
roadmap = """'use client';

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
"""

open('app/roadmap/page.tsx', 'w', encoding='utf-8').write(roadmap)
print('CREATED: roadmap page')

print('All done!')