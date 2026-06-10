'use client';

import { useState, useEffect } from 'react';

export default function Pricing() {
  const [bnbPrice, setBnbPrice] = useState<number>(0);
  const [bnbProAmount, setBnbProAmount] = useState<string>('...');
  const [bnbEnterpriseAmount, setBnbEnterpriseAmount] = useState<string>('...');
  const [selectedPlan, setSelectedPlan] = useState<string | null>(null);
  const [paymentMethod, setPaymentMethod] = useState<'USDT' | 'BNB'>('USDT');
  const [txHash, setTxHash] = useState('');
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  useEffect(() => {
    fetchBNBPrice();
  }, []);

  const fetchBNBPrice = async () => {
    try {
      const response = await fetch('https://api.binance.com/api/v3/ticker/price?symbol=BNBUSDT');
      const data = await response.json();
      const price = parseFloat(data.price);
      setBnbPrice(price);
      setBnbProAmount((10 / price).toFixed(6));
      setBnbEnterpriseAmount((50 / price).toFixed(6));
    } catch {
      setBnbProAmount('~0.02');
      setBnbEnterpriseAmount('~0.1');
    }
  };

  const paymentWallet = process.env.NEXT_PUBLIC_PAYMENT_WALLET;

  const handleVerifyPayment = async () => {
    if (!txHash || !email || !selectedPlan) {
      setError('Please fill in all fields');
      return;
    }

    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      const response = await fetch('/api/billing/verify-payment', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          txHash,
          plan: selectedPlan,
          paymentMethod,
          userEmail: email,
        }),
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.error);

      setSuccess('Payment verified! Your ' + selectedPlan + ' plan is now active.');
      setTxHash('');
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const plans = [
    {
      key: 'free',
      name: 'Free',
      usdtPrice: 0,
      bnbPrice: '0',
      description: 'Get started with basic verification',
      features: [
        '10 verifications per month',
        'Basic AI analysis',
        'PDF certificates',
        'BNB blockchain registration',
        'Public verification portal',
      ],
      cta: 'Get started',
      highlight: false,
    },
    {
      key: 'pro',
      name: 'Pro',
      usdtPrice: 10,
      bnbPrice: bnbProAmount,
      description: 'For creators and professionals',
      features: [
        'Unlimited verifications',
        'Priority AI analysis',
        'NFT certificates',
        'API access (1000 calls/month)',
        'Email support',
        'Advanced deepfake detection',
      ],
      cta: 'Upgrade to Pro',
      highlight: true,
    },
    {
      key: 'enterprise',
      name: 'Enterprise',
      usdtPrice: 50,
      bnbPrice: bnbEnterpriseAmount,
      description: 'For businesses and organizations',
      features: [
        'Everything in Pro',
        'Bulk verification',
        'Unlimited API access',
        'Custom integration support',
        'Dedicated account manager',
        'White-label option',
        'SLA guarantee',
      ],
      cta: 'Contact us',
      highlight: false,
    },
  ];

  return (
    <main className="min-h-screen bg-gray-50">
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-5xl mx-auto px-6 py-4 flex items-center justify-between">
          <button
            onClick={() => window.location.href = '/'}
            className="flex items-center gap-3 bg-transparent border-0 cursor-pointer p-0"
          >
            <div className="w-8 h-8 bg-black rounded-lg flex items-center justify-center">
              <span className="text-white text-xs font-bold">UH</span>
            </div>
            <span className="font-semibold text-gray-900">UHRATE</span>
          </button>
          <button
            onClick={() => window.location.href = '/'}
            className="px-4 py-2 bg-black text-white rounded-xl text-sm font-medium hover:bg-gray-800 transition-colors"
          >
            Start Verifying
          </button>
        </div>
      </header>

      <div className="max-w-5xl mx-auto px-6 py-16">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Simple, transparent pricing
          </h1>
          <p className="text-gray-500 text-lg">
            Pay with USDT or BNB on BNB Chain. No hidden fees.
          </p>
          {bnbPrice > 0 && (
            <p className="text-sm text-gray-400 mt-2">
              Live BNB price: ${bnbPrice.toFixed(2)}
            </p>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-16">
          {plans.map(plan => (
            <div
              key={plan.key}
              className={"bg-white border rounded-2xl p-6 " + (
                plan.highlight
                  ? 'border-black shadow-lg'
                  : 'border-gray-200'
              )}
            >
              {plan.highlight && (
                <div className="inline-block px-3 py-1 bg-black text-white text-xs font-medium rounded-full mb-4">
                  Most Popular
                </div>
              )}
              <h3 className="text-xl font-bold text-gray-900">{plan.name}</h3>
              <p className="text-gray-500 text-sm mt-1 mb-4">{plan.description}</p>

              <div className="mb-6">
                {plan.usdtPrice === 0 ? (
                  <p className="text-3xl font-bold text-gray-900">Free</p>
                ) : (
                  <div>
                    <p className="text-3xl font-bold text-gray-900">
                      ${plan.usdtPrice}
                      <span className="text-base font-normal text-gray-500">/month</span>
                    </p>
                    <p className="text-sm text-gray-400 mt-1">
                      or {plan.bnbPrice} BNB/month
                    </p>
                  </div>
                )}
              </div>

              <ul className="space-y-3 mb-6">
                {plan.features.map(feature => (
                  <li key={feature} className="flex items-center gap-2 text-sm text-gray-600">
                    <span className="text-green-500 font-bold">✓</span>
                    {feature}
                  </li>
                ))}
              </ul>

              {plan.key === 'free' ? (
                <button
                  onClick={() => window.location.href = '/register'}
                  className="w-full py-3 border border-gray-300 text-gray-700 rounded-xl text-sm font-medium hover:bg-gray-50 transition-colors"
                >
                  {plan.cta}
                </button>
              ) : plan.key === 'enterprise' ? (
                <button
                  onClick={() => window.location.href = 'mailto:hello@uhrate.xyz'}
                  className="w-full py-3 border border-gray-300 text-gray-700 rounded-xl text-sm font-medium hover:bg-gray-50 transition-colors"
                >
                  {plan.cta}
                </button>
              ) : (
                <button
                  onClick={() => setSelectedPlan(plan.key)}
                  className="w-full py-3 bg-black text-white rounded-xl text-sm font-medium hover:bg-gray-800 transition-colors"
                >
                  {plan.cta}
                </button>
              )}
            </div>
          ))}
        </div>

        {selectedPlan && (
          <div className="bg-white border border-gray-200 rounded-2xl p-8 max-w-xl mx-auto">
            <h3 className="font-bold text-gray-900 text-lg mb-2">
              Activate {selectedPlan.charAt(0).toUpperCase() + selectedPlan.slice(1)} Plan
            </h3>
            <p className="text-gray-500 text-sm mb-6">
              Send payment to the wallet below, then paste your transaction hash to activate.
            </p>

            <div className="bg-gray-50 rounded-xl p-4 mb-6">
              <p className="text-xs text-gray-500 font-medium mb-1">Payment Wallet</p>
              <p className="font-mono text-sm text-gray-900 break-all">{paymentWallet}</p>
            </div>

            <div className="flex gap-3 mb-6">
              <button
                onClick={() => setPaymentMethod('USDT')}
                className={"flex-1 py-3 rounded-xl text-sm font-medium border transition-colors " + (
                  paymentMethod === 'USDT'
                    ? 'bg-black text-white border-black'
                    : 'bg-white text-gray-700 border-gray-300'
                )}
              >
                Pay with USDT
                <span className="block text-xs mt-0.5 opacity-70">
                  ${selectedPlan === 'pro' ? 10 : 50} USDT BEP20
                </span>
              </button>
              <button
                onClick={() => setPaymentMethod('BNB')}
                className={"flex-1 py-3 rounded-xl text-sm font-medium border transition-colors " + (
                  paymentMethod === 'BNB'
                    ? 'bg-black text-white border-black'
                    : 'bg-white text-gray-700 border-gray-300'
                )}
              >
                Pay with BNB
                <span className="block text-xs mt-0.5 opacity-70">
                  {selectedPlan === 'pro' ? bnbProAmount : bnbEnterpriseAmount} BNB
                </span>
              </button>
            </div>

            <div className="space-y-4">
              {error && (
                <div className="p-4 bg-red-50 border border-red-200 rounded-xl text-red-600 text-sm">
                  {error}
                </div>
              )}
              {success && (
                <div className="p-4 bg-green-50 border border-green-200 rounded-xl text-green-600 text-sm">
                  {success}
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Your Email
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  placeholder="your@email.com"
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-black"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Transaction Hash
                </label>
                <input
                  type="text"
                  value={txHash}
                  onChange={e => setTxHash(e.target.value)}
                  placeholder="0x..."
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-black font-mono"
                />
              </div>

              <button
                onClick={handleVerifyPayment}
                disabled={loading}
                className="w-full py-3 bg-black text-white rounded-xl text-sm font-medium hover:bg-gray-800 transition-colors disabled:opacity-50"
              >
                {loading ? 'Verifying payment...' : 'Verify & Activate Plan'}
              </button>

              <button
                onClick={() => setSelectedPlan(null)}
                className="w-full py-3 border border-gray-300 text-gray-700 rounded-xl text-sm font-medium hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        )}

        <div className="mt-16 text-center">
          <h3 className="font-semibold text-gray-900 mb-4">Accepted payments</h3>
          <div className="flex justify-center gap-6">
            <div className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-xl">
              <span className="text-yellow-500 font-bold">⬡</span>
              <span className="text-sm font-medium">BNB Chain</span>
            </div>
            <div className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-xl">
              <span className="text-green-500 font-bold">$</span>
              <span className="text-sm font-medium">USDT BEP20</span>
            </div>
          </div>
          <p className="text-xs text-gray-400 mt-4">
            All payments are on-chain and verifiable. No refunds on crypto payments.
          </p>
        </div>
      </div>
    </main>
  );
}