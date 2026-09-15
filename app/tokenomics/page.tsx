'use client';
import Nav from '../components/Nav';
import Footer from '../components/Footer';

import { useState } from 'react';

export default function Tokenomics() {
  const [copied, setCopied] = useState(false);

  const allocation = [
    { category: 'Community & Ecosystem', percent: 30, tokens: '300,000,000', vesting: 'Released over 4 years', color: 'bg-blue-500' },
    { category: 'Platform Rewards & Staking', percent: 20, tokens: '200,000,000', vesting: 'Monthly unlock over 3 years', color: 'bg-purple-500' },
    { category: 'Team & Founders', percent: 15, tokens: '150,000,000', vesting: '12-month cliff, 3-year vest', color: 'bg-gray-700' },
    { category: 'Public Sale', percent: 12, tokens: '120,000,000', vesting: '20% TGE, 80% over 12 months', color: 'bg-green-500' },
    { category: 'Treasury & Reserve', percent: 10, tokens: '100,000,000', vesting: 'Locked 2 years, DAO controlled', color: 'bg-amber-500' },
    { category: 'Presale', percent: 8, tokens: '80,000,000', vesting: '6-month cliff, 18-month vest', color: 'bg-red-500' },
    { category: 'Advisors & Partners', percent: 5, tokens: '50,000,000', vesting: '6-month cliff, 2-year vest', color: 'bg-pink-500' },
  ];

  const utilities = [
    { icon: '🔐', title: 'Blockchain Deployment Fee', desc: 'Pay $0.20 in ETH/BNB/MATIC or just $0.10 worth of UHR to deploy any document to the blockchain. UHR holders get 50% discount on all deployment fees.' },
    { icon: '📄', title: 'Document Identity', desc: 'Every document verified on UHRATE receives a full NFT certificate with permanent on-chain identity. UHR makes this cheaper and faster.' },
    { icon: '🔐', title: 'Staking & Earning', desc: 'Stake BNB, USDT, or UHR to earn UHR rewards. Flexible (10% APY), 30-day (15% APY), or 90-day (20% APY) pools.' },
    { icon: '🗳️', title: 'Governance Voting', desc: 'UHR holders vote on platform proposals, treasury spending, new features, and supported blockchains.' },
    { icon: '🔥', title: 'Fee Burn', desc: '10% of all UHR collected as platform fees is permanently burned, reducing supply over time.' },
    { icon: '📈', title: 'Buyback & Burn', desc: '20% of platform revenue (USDT/BNB) is used quarterly to buy UHR from the market and burn it.' },
  ];

  const staking = [
    { pool: 'Flexible', lock: 'No lock', apy: '10%', color: 'border-blue-200 bg-blue-50' },
    { pool: 'Standard', lock: '30 days', apy: '15%', color: 'border-purple-200 bg-purple-50' },
    { pool: 'Premium', lock: '90 days', apy: '20%', color: 'border-amber-200 bg-amber-50' },
  ];

  const phases = [
    { phase: '01', title: 'Token Launch', desc: 'UHR token deployed on BNB Smart Chain. Tokenomics and whitepaper published.', active: true },
    { phase: '02', title: 'Presale', desc: 'Early supporters acquire UHR at presale pricing of $0.01 per token. Limited to 80,000,000 UHR.', active: true },
    { phase: '03', title: 'Public Sale', desc: 'Community sale via launchpad. UHRATE platform users get priority whitelist access.', active: false },
    { phase: '04', title: 'DEX Listing', desc: 'Initial listing on PancakeSwap. Liquidity provided from treasury. CEX applications begin.', active: false },
    { phase: '05', title: 'Staking Launch', desc: 'Deploy staking platform. Enable UHR deployment fee discounts. Begin fee burn mechanism.', active: false },
    { phase: '06', title: 'DAO Launch', desc: 'Transfer treasury to DAO smart contract. Enable full community governance voting.', active: false },
  ];

  const copyAddress = () => {
    navigator.clipboard.writeText('0xFD8723F83F5A441EdB231F2ef1f89113B481E447');
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <main className="min-h-screen bg-white overflow-x-hidden">
      <header className="bg-white border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-4 flex items-center justify-between">
          <button onClick={() => window.location.href = '/'} className="flex items-center gap-3 bg-transparent border-0 cursor-pointer p-0">
            <div className="w-8 h-8 bg-black rounded-lg flex items-center justify-center">
              <span className="text-white text-xs font-bold">UH</span>
            </div>
            <span className="font-bold text-gray-900">UHRATE</span>
          </button>
          <div className="flex items-center gap-3">
            <button onClick={() => window.location.href = '/presale'} className="text-sm text-red-600 font-semibold hover:text-red-700 bg-transparent border-0 cursor-pointer">
              🔥 Join Presale
            </button>
            <button onClick={() => window.location.href = '/swap'} className="text-sm text-gray-600 hover:text-gray-900 bg-transparent border-0 cursor-pointer">Buy UHR</button>
            <button onClick={() => window.location.href = '/whitepaper'} className="text-sm text-gray-600 hover:text-gray-900 bg-transparent border-0 cursor-pointer">Whitepaper</button>
            <button onClick={() => window.location.href = '/register'} className="px-4 py-2 bg-black text-white rounded-xl text-sm font-medium hover:bg-gray-800 transition-colors">Get Started</button>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="bg-black text-white py-20 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/10 rounded-full text-sm mb-6">
            <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
            Live on BNB Smart Chain
          </div>
          <h1 className="text-4xl sm:text-6xl font-bold mb-6">UHR Tokenomics</h1>
          <p className="text-xl text-gray-300 mb-8 max-w-2xl mx-auto">
            The UHRATE Token (UHR) powers the decentralized authenticity network — combining utility, governance, and staking in one token.
          </p>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 max-w-2xl mx-auto mb-8">
            {[
              { label: 'Token Name', value: 'UHRATE' },
              { label: 'Ticker', value: 'UHR' },
              { label: 'Total Supply', value: '1 Billion' },
              { label: 'Network', value: 'BNB Chain' },
            ].map(item => (
              <div key={item.label} className="bg-white/10 rounded-xl p-4">
                <p className="text-gray-400 text-xs mb-1">{item.label}</p>
                <p className="font-bold text-white">{item.value}</p>
              </div>
            ))}
          </div>
          <div className="flex gap-3 justify-center flex-wrap">
            <button
              onClick={() => window.location.href = '/presale'}
              className="px-8 py-3 bg-red-500 text-white rounded-xl text-sm font-bold hover:bg-red-600 transition-colors"
            >
              🔥 Join Presale — $0.01/UHR
            </button>
            <button
              onClick={() => window.location.href = '/swap'}
              className="px-8 py-3 bg-white/10 border border-white/20 text-white rounded-xl text-sm font-semibold hover:bg-white/20 transition-colors"
            >
              Buy UHR — $0.02/UHR
            </button>
          </div>
        </div>
      </section>

      {/* Contract Address */}
      <section className="bg-gray-50 py-8 px-4 border-b border-gray-200">
        <div className="max-w-4xl mx-auto text-center">
          <p className="text-sm text-gray-500 mb-2">Contract Address (BEP20)</p>
          <div className="flex items-center justify-center gap-3 flex-wrap">
            <p className="font-mono text-sm text-gray-900 bg-white border border-gray-200 px-4 py-2 rounded-xl break-all">
              0xFD8723F83F5A441EdB231F2ef1f89113B481E447
            </p>
            <button onClick={copyAddress} className="px-4 py-2 bg-black text-white rounded-xl text-sm font-medium hover:bg-gray-800 transition-colors">
              {copied ? '✓ Copied!' : 'Copy'}
            </button>
            <button onClick={() => window.open('https://bscscan.com/token/0xFD8723F83F5A441EdB231F2ef1f89113B481E447', '_blank')} className="px-4 py-2 border border-gray-300 text-gray-700 rounded-xl text-sm font-medium hover:bg-gray-50 transition-colors">
              View on BSCScan
            </button>
          </div>
        </div>
      </section>

      {/* Presale Banner */}
      <section className="bg-gradient-to-r from-red-500 to-orange-500 py-6 px-4">
        <div className="max-w-4xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="text-white text-center sm:text-left">
            <p className="font-bold text-lg">🔥 Presale Now Live — $0.01 per UHR</p>
            <p className="text-red-100 text-sm">80,000,000 UHR available · Limited time · Connect wallet to participate</p>
          </div>
          <button
            onClick={() => window.location.href = '/presale'}
            className="px-8 py-3 bg-white text-red-600 rounded-xl text-sm font-bold hover:bg-red-50 transition-colors whitespace-nowrap flex-shrink-0"
          >
            Join Presale →
          </button>
        </div>
      </section>

      {/* Token Allocation */}
      <section className="py-20 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Token Allocation</h2>
            <p className="text-gray-500">1,000,000,000 UHR total supply — fixed, no minting ever</p>
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
            <div className="space-y-3">
              {allocation.map(item => (
                <div key={item.category} className={"bg-white border rounded-xl p-4 " + (item.category === 'Presale' ? 'border-red-300 bg-red-50' : 'border-gray-200')}>
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-3">
                      <div className={"w-3 h-3 rounded-full " + item.color} />
                      <p className="font-medium text-gray-900 text-sm">{item.category}</p>
                      {item.category === 'Presale' && (
                        <span className="px-2 py-0.5 bg-red-500 text-white text-xs rounded-full font-bold">LIVE</span>
                      )}
                    </div>
                    <span className="font-bold text-gray-900">{item.percent}%</span>
                  </div>
                  <div className="h-2 bg-gray-100 rounded-full overflow-hidden mb-2">
                    <div className={"h-full rounded-full " + item.color} style={{ width: item.percent + '%' }} />
                  </div>
                  <div className="flex justify-between text-xs text-gray-500">
                    <span>{item.tokens} UHR</span>
                    <span>{item.vesting}</span>
                  </div>
                </div>
              ))}
            </div>
            <div className="bg-black rounded-2xl p-8 text-white sticky top-24">
              <h3 className="font-bold text-xl mb-6">Distribution Summary</h3>
              <div className="space-y-4">
                {allocation.map(item => (
                  <div key={item.category} className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className={"w-2 h-2 rounded-full " + item.color} />
                      <span className="text-gray-300 text-sm">{item.category}</span>
                    </div>
                    <span className="font-bold">{item.percent}%</span>
                  </div>
                ))}
              </div>
              <div className="mt-6 pt-6 border-t border-white/20">
                <div className="flex justify-between mb-4">
                  <span className="text-gray-400">Total</span>
                  <span className="font-bold">100% — 1,000,000,000 UHR</span>
                </div>
                <button
                  onClick={() => window.location.href = '/presale'}
                  className="w-full py-3 bg-red-500 text-white rounded-xl text-sm font-bold hover:bg-red-600 transition-colors"
                >
                  🔥 Join Presale — $0.01/UHR
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Utility & Governance */}
      <section className="bg-gray-50 py-20 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Utility & Governance</h2>
            <p className="text-gray-500">UHR is both a utility token and a governance token</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {utilities.map(item => (
              <div key={item.title} className="bg-white border border-gray-200 rounded-2xl p-6">
                <div className="text-3xl mb-4">{item.icon}</div>
                <h3 className="font-semibold text-gray-900 mb-2">{item.title}</h3>
                <p className="text-gray-500 text-sm leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Fee Comparison */}
      <section className="py-20 px-4">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Deployment Fee — Hold UHR, Pay Less</h2>
            <p className="text-gray-500">Every document deployed to blockchain requires a small platform fee</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div className="border-2 border-gray-200 rounded-2xl p-8 text-center">
              <p className="text-gray-500 text-sm mb-2">Pay with ETH / BNB / MATIC</p>
              <p className="text-5xl font-black text-gray-900 mb-2">$0.20</p>
              <p className="text-gray-400 text-sm">per document deployment</p>
              <div className="mt-6 space-y-2 text-left">
                {['Full NFT certificate', 'On-chain hash record', 'IPFS metadata storage', 'Multi-chain support'].map(f => (
                  <p key={f} className="text-sm text-gray-600 flex items-center gap-2">
                    <span className="text-green-500">✓</span> {f}
                  </p>
                ))}
              </div>
            </div>
            <div className="border-2 border-black rounded-2xl p-8 text-center relative overflow-hidden">
              <div className="absolute top-4 right-4 px-3 py-1 bg-black text-white text-xs font-bold rounded-full">50% OFF</div>
              <p className="text-gray-500 text-sm mb-2">Pay with UHR Token</p>
              <p className="text-5xl font-black text-black mb-2">$0.10</p>
              <p className="text-gray-400 text-sm">worth of UHR tokens</p>
              <div className="mt-6 space-y-2 text-left">
                {['Full NFT certificate', 'On-chain hash record', 'IPFS metadata storage', 'Multi-chain support', '50% cheaper than ETH/BNB'].map(f => (
                  <p key={f} className="text-sm text-gray-900 flex items-center gap-2 font-medium">
                    <span className="text-green-500">✓</span> {f}
                  </p>
                ))}
              </div>
              <button onClick={() => window.location.href = '/presale'} className="mt-6 w-full py-3 bg-black text-white rounded-xl text-sm font-bold hover:bg-gray-800 transition-colors">
                Get UHR Tokens →
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Staking */}
      <section className="bg-gray-50 py-20 px-4">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Staking Pools</h2>
            <p className="text-gray-500">Stake BNB, USDT, or UHR to earn UHR rewards</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-8">
            {staking.map(item => (
              <div key={item.pool} className={"border-2 rounded-2xl p-6 text-center " + item.color}>
                <h3 className="font-bold text-gray-900 text-lg mb-1">{item.pool}</h3>
                <p className="text-gray-500 text-sm mb-4">{item.lock}</p>
                <p className="text-4xl font-bold text-gray-900 mb-1">{item.apy}</p>
                <p className="text-gray-500 text-sm">Annual APY</p>
              </div>
            ))}
          </div>
          <div className="bg-white border border-gray-200 rounded-2xl p-6 text-center">
            <p className="text-gray-700 font-medium mb-1">Accepted staking assets</p>
            <p className="text-gray-500 text-sm">BNB · USDT (BEP20) · UHR</p>
            <p className="text-gray-400 text-xs mt-2">All rewards paid in UHR tokens</p>
          </div>
        </div>
      </section>

      {/* Deflationary */}
      <section className="bg-black text-white py-20 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl font-bold mb-4">Deflationary by Design</h2>
          <p className="text-gray-400 mb-12">Multiple mechanisms reduce UHR supply over time</p>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            {[
              { icon: '🔥', title: '10% Fee Burn', desc: 'Ten percent of all UHR platform fees burned permanently' },
              { icon: '📉', title: 'Buyback & Burn', desc: '20% of USDT/BNB revenue used quarterly to buy and burn UHR' },
              { icon: '⚡', title: 'Slash Burn', desc: 'Fraudulent badge stakes are burned not redistributed' },
            ].map(item => (
              <div key={item.title} className="bg-white/10 rounded-2xl p-6">
                <div className="text-3xl mb-3">{item.icon}</div>
                <h3 className="font-semibold mb-2">{item.title}</h3>
                <p className="text-gray-400 text-sm">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Roadmap */}
      <section className="py-20 px-4">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Token Launch Roadmap</h2>
            <p className="text-gray-500">From token deployment to full DAO governance</p>
          </div>
          <div className="space-y-4">
            {phases.map((item, i) => (
              <div key={item.phase} className={"flex gap-4 p-5 rounded-2xl border " + (item.active ? 'bg-black text-white border-black' : 'bg-white border-gray-200')}>
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
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="bg-gray-50 py-20 px-4">
        <div className="max-w-2xl mx-auto text-center">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">Join the UHRATE Ecosystem</h2>
          <p className="text-gray-500 mb-8">Start using the platform today and participate in the UHR presale.</p>
          <div className="flex gap-3 justify-center flex-wrap">
            <button onClick={() => window.location.href = '/presale'} className="px-8 py-3 bg-red-500 text-white rounded-xl text-sm font-bold hover:bg-red-600 transition-colors">
              🔥 Join Presale
            </button>
            <button onClick={() => window.location.href = '/swap'} className="px-8 py-3 bg-black text-white rounded-xl text-sm font-semibold hover:bg-gray-800 transition-colors">
              Buy UHR
            </button>
            <button onClick={() => window.location.href = '/register'} className="px-8 py-3 border border-gray-300 text-gray-700 rounded-xl text-sm font-semibold hover:bg-gray-50 transition-colors">
              Create Account
            </button>
            <button onClick={() => window.open('https://bscscan.com/token/0xFD8723F83F5A441EdB231F2ef1f89113B481E447', '_blank')} className="px-8 py-3 border border-gray-300 text-gray-700 rounded-xl text-sm font-semibold hover:bg-gray-50 transition-colors">
              View on BSCScan
            </button>
          </div>
        </div>
      </section>

      <Footer />
    </main>
  );
}