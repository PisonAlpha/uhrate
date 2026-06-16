'use client';

export default function Whitepaper() {
  return (
    <main className="min-h-screen bg-white overflow-x-hidden">
      <header className="bg-white border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 py-4 flex items-center justify-between">
          <button onClick={() => window.location.href = '/'} className="flex items-center gap-3 bg-transparent border-0 cursor-pointer p-0">
            <div className="w-8 h-8 bg-black rounded-lg flex items-center justify-center">
              <span className="text-white text-xs font-bold">UH</span>
            </div>
            <span className="font-bold text-gray-900">UHRATE</span>
          </button>
          <div className="flex items-center gap-3">
            <button onClick={() => window.location.href = '/tokenomics'} className="text-sm text-gray-600 hover:text-gray-900 bg-transparent border-0 cursor-pointer">Tokenomics</button>
            <button onClick={() => window.location.href = '/register'} className="px-4 py-2 bg-black text-white rounded-xl text-sm font-medium hover:bg-gray-800 transition-colors">Get Started</button>
          </div>
        </div>
      </header>

      <section className="bg-black text-white py-20 px-4">
        <div className="max-w-3xl mx-auto text-center">
          <img src="/uhrate-logo.jpeg" alt="UHRATE" className="w-20 h-20 mx-auto mb-6 rounded-2xl" />
          <h1 className="text-4xl sm:text-5xl font-bold mb-4">UHRATE Whitepaper</h1>
          <p className="text-gray-400 text-lg mb-8">
            Decentralized Authenticity Network — Token, Technology, and Tokenomics
          </p>
          <div className="flex gap-3 justify-center flex-wrap">
            <button
              onClick={() => {
                const link = document.createElement('a');
                link.href = '/uhrate-whitepaper.pdf';
                link.download = 'UHRATE-Whitepaper.pdf';
                link.click();
              }}
              className="px-8 py-3 bg-white text-black rounded-xl text-sm font-semibold hover:bg-gray-200 transition-colors"
            >
              Download PDF
            </button>
            <button
              onClick={() => window.open('/uhrate-whitepaper.pdf', '_blank')}
              className="px-8 py-3 border border-gray-600 text-white rounded-xl text-sm font-semibold hover:bg-white/10 transition-colors"
            >
              View in Browser
            </button>
          </div>
        </div>
      </section>

      <section className="py-12 px-4">
        <div className="max-w-5xl mx-auto">
          <div className="bg-gray-50 border border-gray-200 rounded-2xl overflow-hidden" style={{ height: '85vh' }}>
            <iframe
              src="/uhrate-whitepaper.pdf"
              className="w-full h-full"
              title="UHRATE Whitepaper"
            />
          </div>
        </div>
      </section>

      <section className="bg-gray-50 py-16 px-4">
        <div className="max-w-2xl mx-auto text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Want to learn more about UHR?</h2>
          <p className="text-gray-500 mb-6">Explore the full tokenomics breakdown, staking pools, and governance model.</p>
          <button onClick={() => window.location.href = '/tokenomics'} className="px-8 py-3 bg-black text-white rounded-xl text-sm font-semibold hover:bg-gray-800 transition-colors">
            View Tokenomics
          </button>
        </div>
      </section>

      <footer className="border-t border-gray-200 py-8 px-4">
        <div className="max-w-5xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <button onClick={() => window.location.href = '/'} className="flex items-center gap-2 bg-transparent border-0 cursor-pointer p-0">
            <div className="w-6 h-6 bg-black rounded flex items-center justify-center">
              <span className="text-white text-xs font-bold">UH</span>
            </div>
            <span className="font-bold text-gray-900">UHRATE</span>
          </button>
          <p className="text-xs text-gray-400">© 2026 UHRATE</p>
        </div>
      </footer>
    </main>
  );
}