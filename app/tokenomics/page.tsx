'use client';

export default function Tokenomics() {
  const allocation = [
    { category: 'Community & Ecosystem', percent: 30, tokens: '300,000,000', vesting: 'Released over 4 years', color: 'bg-blue-500' },
    { category: 'Platform Rewards & Staking', percent: 20, tokens: '200,000,000', vesting: 'Monthly unlock over 3 years', color: 'bg-purple-500' },
    { category: 'Team & Founders', percent: 15, tokens: '150,000,000', vesting: '12-month cliff, 3-year vest', color: 'bg-gray-700' },
    { category: 'Public Sale', percent: 12, tokens: '120,000,000', vesting: '20% TGE, 80% over 12 months', color: 'bg-green-500' },
    { category: 'Treasury & Reserve', percent: 10, tokens: '100,000,000', vesting: 'Locked 2 years, DAO controlled', color: 'bg-amber-500' },
    { category: 'Private Sale', percent: 8, tokens: '80,000,000', vesting: '6-month cliff, 18-month vest', color: 'bg-red-500' },
    { category: 'Advisors & Partners', percent: 5, tokens: '50,000,000', vesting: '6-month cliff, 2-year vest', color: 'bg-pink-500' },
  ];

  const utilities = [
    { icon: '💳', title: 'Subscription Payment', desc: 'Pay for Pro ($10) and Enterprise ($50) plans using UHR tokens at a 20% discount vs USDT pricing.' },
    { icon: '🔐', title: 'Staking & Earning', desc: 'Stake BNB, USDT, or UHR to earn UHR rewards. Flexible (10% APY), 30-day (15% APY), or 90-day (20% APY) pools.' },
    { icon: '🗳️', title: 'Governance Voting', desc: 'UHR holders vote on platform proposals, treasury spending, new features, and supported blockchains.' },
    { icon: '🏛️', title: 'DAO Treasury', desc: '10% of total supply locked in a community treasury controlled by UHR governance votes.' },
    { icon: '🔥', title: 'Fee Burn', desc: '10% of all UHR collected as platform fees is permanently burned, reducing supply over time.' },
    { icon: '📈', title: 'Buyback & Burn', desc: '20% of platform revenue (USDT/BNB) is used quarterly to buy UHR from the market and burn it.' },
  ];

  const staking = [
    { pool: 'Flexible', lock: 'No lock', apy: '10%', color: 'border-blue-200 bg-blue-50' },
    { pool: 'Standard', lock: '30 days', apy: '15%', color: 'border-purple-200 bg-purple-50' },
    { pool: 'Premium', lock: '90 days', apy: '20%', color: 'border-amber-200 bg-amber-50' },
  ];

  const phases = [
    { phase: '01', title: 'Token Launch', desc: 'Deploy UHR token on BNB Smart Chain. Publish tokenomics and whitepaper.' },
    { phase: '02', title: 'Private Sale', desc: 'Strategic investors and early supporters acquire UHR at seed pricing with vesting.' },
    { phase: '03', title: 'Public Sale', desc: 'Community sale via launchpad. UHRATE platform users get priority whitelist access.' },
    { phase: '04', title: 'DEX Listing', desc: 'Initial listing on PancakeSwap. Liquidity provided from treasury. CEX applications begin.' },
    { phase: '05', title: 'Staking Launch', desc: 'Deploy staking platform. Enable UHR subscription payments. Begin fee burn mechanism.' },
    { phase: '06', title: 'DAO Launch', desc: 'Transfer treasury to DAO smart contract. Enable full community governance voting.' },
  ];

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
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 max-w-2xl mx-auto">
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
            <button
              onClick={() => {
                navigator.clipboard.writeText('0xFD8723F83F5A441EdB231F2ef1f89113B481E447');
                alert('Contract address copied!');
              }}
              className="px-4 py-2 bg-black text-white rounded-xl text-sm font-medium hover:bg-gray-800 transition-colors"
            >
              Copy
            </button>
            <button
              onClick={() => window.open('https://bscscan.com/token/0xFD8723F83F5A441EdB231F2ef1f89113B481E447', '_blank')}
              className="px-4 py-2 border border-gray-300 text-gray-700 rounded-xl text-sm font-medium hover:bg-gray-50 transition-colors"
            >
              View on BSCScan
            </button>
          </div>
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
                <div key={item.category} className="bg-white border border-gray-200 rounded-xl p-4">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-3">
                      <div className={"w-3 h-3 rounded-full " + item.color} />
                      <p className="font-medium text-gray-900 text-sm">{item.category}</p>
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
                <div className="flex justify-between">
                  <span className="text-gray-400">Total</span>
                  <span className="font-bold">100% — 1,000,000,000 UHR</span>
                </div>
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

      {/* Staking */}
      <section className="py-20 px-4">
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
          <div className="bg-gray-50 border border-gray-200 rounded-2xl p-6 text-center">
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
              <div key={item.phase} className={"flex gap-4 p-5 rounded-2xl border " + (i === 0 || i === 1 ? 'bg-black text-white border-black' : 'bg-white border-gray-200')}>
                <span className={"text-2xl font-bold font-mono flex-shrink-0 " + (i === 0 || i === 1 ? 'text-gray-400' : 'text-gray-300')}>
                  {item.phase}
                </span>
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className={"font-semibold " + (i === 0 || i === 1 ? 'text-white' : 'text-gray-900')}>{item.title}</h3>
                    {(i === 0 || i === 1) && (
                      <span className="px-2 py-0.5 bg-green-500 text-white text-xs rounded-full font-medium">Active</span>
                    )}
                  </div>
                  <p className={"text-sm " + (i === 0 || i === 1 ? 'text-gray-400' : 'text-gray-500')}>{item.desc}</p>
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
          <p className="text-gray-500 mb-8">Start using the platform today and be ready for the UHR token launch.</p>
          <div className="flex gap-3 justify-center flex-wrap">
            <button onClick={() => window.location.href = '/register'} className="px-8 py-3 bg-black text-white rounded-xl text-sm font-semibold hover:bg-gray-800 transition-colors">
              Create Account
            </button>
            <button onClick={() => window.location.href = '/whitepaper'} className="px-8 py-3 border border-gray-300 text-gray-700 rounded-xl text-sm font-semibold hover:bg-gray-50 transition-colors">
              Read Whitepaper
            </button>
            <button
              onClick={() => window.open('https://bscscan.com/token/0xFD8723F83F5A441EdB231F2ef1f89113B481E447', '_blank')}
              className="px-8 py-3 border border-gray-300 text-gray-700 rounded-xl text-sm font-semibold hover:bg-gray-50 transition-colors"
            >
              View on BSCScan
            </button>
          </div>
        </div>
      </section>

      <footer className="border-t border-gray-200 py-8 px-4">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <button onClick={() => window.location.href = '/'} className="flex items-center gap-2 bg-transparent border-0 cursor-pointer p-0">
            <div className="w-6 h-6 bg-black rounded flex items-center justify-center">
              <span className="text-white text-xs font-bold">UH</span>
            </div>
            <span className="font-bold text-gray-900">UHRATE</span>
          </button>
          <p className="text-xs text-gray-400 text-center">This is not financial advice. Cryptocurrency investments carry risk. Always do your own research.</p>
          <p className="text-xs text-gray-400">© 2026 UHRATE</p>
        </div>
      </footer>
    </main>
  );
}