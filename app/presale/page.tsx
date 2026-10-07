'use client';

import { useRouter } from 'next/navigation';

const PRESALE_CONTRACT = '0xaDE648982c4ABceB02A48BE71B71C45580f6Ca08';
const UHR_CONTRACT = '0xFD8723F83F5A441EdB231F2ef1f89113B481E447';
const TOTAL_TOKENS = 80000000;
const tokensSold = 12450000;
const progressPct = Math.min(Math.round((tokensSold / TOTAL_TOKENS) * 100), 100);

export default function Presale() {
  return (
    <main className="min-h-screen bg-black text-white">
      <header className="border-b border-white/10 px-6 py-4">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <button onClick={() => window.location.href = '/'} className="flex items-center gap-3 bg-transparent border-0 cursor-pointer p-0">
            <div className="w-8 h-8 bg-white rounded-lg flex items-center justify-center">
              <span className="text-black text-xs font-bold">UH</span>
            </div>
            <span className="font-bold text-white">UHRATE</span>
          </button>
          <div className="flex items-center gap-3">
            <button onClick={() => window.location.href = '/tokenomics'} className="text-sm text-gray-400 hover:text-white bg-transparent border-0 cursor-pointer">Tokenomics</button>
            <button onClick={() => window.location.href = '/swap'} className="text-sm bg-yellow-400 text-black px-4 py-2 rounded-lg font-bold hover:bg-yellow-300 transition-colors border-0 cursor-pointer">Buy UHR</button>
          </div>
        </div>
      </header>

      <div className="max-w-2xl mx-auto px-6 py-16">

        {/* Ended Banner */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-gray-500/20 border border-gray-500/30 rounded-full text-gray-400 text-sm font-medium mb-6">
            🔒 Presale Ended
          </div>
          <h1 className="text-4xl sm:text-5xl font-black mb-4">UHR Token Presale</h1>
          <p className="text-gray-400 text-lg mb-2">The presale has officially ended.</p>
          <p className="text-gray-500 text-sm">Thank you to everyone who participated.</p>
        </div>

        {/* Progress (locked at final state) */}
        <div className="bg-white/5 border border-white/10 rounded-2xl p-6 mb-8">
          <div className="flex justify-between text-sm mb-3">
            <span className="text-gray-400">Presale Progress</span>
            <span className="text-white font-bold">{progressPct}% Sold</span>
          </div>
          <div className="h-4 bg-white/10 rounded-full overflow-hidden mb-3">
            <div className="h-full bg-gradient-to-r from-gray-600 to-gray-500 rounded-full" style={{ width: progressPct + '%' }} />
          </div>
          <div className="flex justify-between text-xs text-gray-500">
            <span>{tokensSold.toLocaleString()} UHR sold</span>
            <span>{TOTAL_TOKENS.toLocaleString()} UHR total</span>
          </div>
        </div>

        {/* CTA Card */}
        <div className="bg-white/5 border border-white/10 rounded-2xl p-8 mb-8 text-center">
          <div className="text-5xl mb-4">🔄</div>
          <h2 className="text-2xl font-black mb-3">Still Want UHR Tokens?</h2>
          <p className="text-gray-400 mb-2">
            You can still buy UHR tokens directly from our swap at the current price.
          </p>
          <p className="text-yellow-400 font-black text-2xl mb-6">$0.02 <span className="text-gray-500 text-base font-normal">per UHR</span></p>

          <button
            onClick={() => window.location.href = '/swap'}
            className="w-full py-4 bg-yellow-400 text-black rounded-xl text-base font-black hover:bg-yellow-300 transition-colors"
          >
            Buy UHR on Swap →
          </button>
          <p className="text-xs text-gray-500 mt-4">Fixed price · Instant delivery · BNB Smart Chain</p>
        </div>

        {/* Info */}
        <div className="bg-white/5 border border-white/10 rounded-2xl p-6 mb-6">
          <h3 className="font-bold mb-4">What is UHR used for?</h3>
          <div className="space-y-4">
            {[
              { step: '1', title: 'Buy UHR on Swap', desc: 'Get UHR tokens at $0.02 each from the UHRATE swap' },
              { step: '2', title: 'Seal Documents', desc: 'Use UHR to pay for document verification on the blockchain' },
              { step: '3', title: 'Verify Anywhere', desc: 'Your sealed documents can be verified by anyone, anywhere' },
            ].map(item => (
              <div key={item.step} className="flex items-start gap-3">
                <div className="w-7 h-7 bg-yellow-400 text-black rounded-full flex items-center justify-center text-xs font-black flex-shrink-0">{item.step}</div>
                <div>
                  <p className="font-semibold text-sm">{item.title}</p>
                  <p className="text-gray-400 text-xs">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white/5 border border-white/10 rounded-xl p-4 text-sm text-gray-500 text-center">
          UHR Token Contract: <span className="font-mono text-xs break-all text-gray-400">{UHR_CONTRACT}</span>
        </div>
      </div>
    </main>
  );
}