'use client';

import { useState, useEffect } from 'react';

const BADGE_TYPES = [
  { value: 'creator', label: '🎨 Content Creator', desc: 'Artists, photographers, videographers' },
  { value: 'journalist', label: '📰 Journalist', desc: 'Reporters, writers, media professionals' },
  { value: 'institution', label: '🏛️ Institution', desc: 'Universities, schools, organizations' },
  { value: 'legal', label: '⚖️ Legal Professional', desc: 'Lawyers, notaries, legal firms' },
  { value: 'medical', label: '🏥 Medical Professional', desc: 'Doctors, hospitals, clinics' },
  { value: 'government', label: '🏢 Government', desc: 'Government agencies and officials' },
  { value: 'business', label: '💼 Business', desc: 'Companies and enterprises' },
  { value: 'developer', label: '💻 Developer', desc: 'Software developers and tech professionals' },
];

const VERIFICATION_METHODS = [
  { value: 'government_id', label: 'Government ID' },
  { value: 'business_registration', label: 'Business Registration' },
  { value: 'professional_license', label: 'Professional License' },
  { value: 'domain_verification', label: 'Domain/Website Verification' },
  { value: 'social_media', label: 'Social Media Profile' },
];

export default function Identity() {
  const [activeTab, setActiveTab] = useState<'apply' | 'lookup'>('apply');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<any>(null);
  const [lookupId, setLookupId] = useState('');
  const [lookupEmail, setLookupEmail] = useState('');
  const [user, setUser] = useState<any>(null);

  const [form, setForm] = useState({
    userEmail: '',
    fullName: '',
    badgeType: '',
    organization: '',
    website: '',
    verificationMethod: '',
    verificationData: '',
  });

  useEffect(() => {
    const stored = localStorage.getItem('uhrate_user');
    if (stored) {
      const u = JSON.parse(stored);
      setUser(u);
      setForm(p => ({ ...p, userEmail: u.email, fullName: u.full_name }));
    }
  }, []);

  const handleApply = async () => {
    if (!form.userEmail || !form.fullName || !form.badgeType || !form.verificationMethod) {
      setError('Please fill in all required fields');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/identity/apply', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.error);
      setResult({ type: 'apply', data });
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleLookup = async () => {
    if (!lookupId && !lookupEmail) {
      setError('Enter a badge ID or email');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const params = lookupId
        ? '?id=' + lookupId
        : '?email=' + lookupEmail;

      const response = await fetch('/api/identity/verify-badge' + params);
      const data = await response.json();
      if (!response.ok) throw new Error(data.error);
      setResult({ type: 'lookup', data });
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-gray-50">
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-4xl mx-auto px-6 py-4 flex items-center justify-between">
          <button onClick={() => window.location.href = '/'} className="flex items-center gap-3 bg-transparent border-0 cursor-pointer p-0">
            <div className="w-8 h-8 bg-black rounded-lg flex items-center justify-center">
              <span className="text-white text-xs font-bold">UH</span>
            </div>
            <span className="font-semibold text-gray-900">UHRATE</span>
          </button>
          <span className="text-sm font-medium text-gray-500">🪪 Identity Badges</span>
        </div>
      </header>

      <div className="max-w-4xl mx-auto px-6 py-12">
        <div className="text-center mb-10">
          <h1 className="text-3xl font-bold text-gray-900 mb-3">Identity Verification Badges</h1>
          <p className="text-gray-500 max-w-xl mx-auto">
            Get a verified identity badge to prove who you are on UHRATE.
            Verified creators, journalists, institutions and professionals get a blue checkmark.
          </p>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-10">
          {[
            { label: 'Creators', icon: '🎨' },
            { label: 'Journalists', icon: '📰' },
            { label: 'Institutions', icon: '🏛️' },
            { label: 'Businesses', icon: '💼' },
          ].map(item => (
            <div key={item.label} className="bg-white border border-gray-200 rounded-xl p-4 text-center">
              <div className="text-2xl mb-2">{item.icon}</div>
              <p className="text-sm font-medium text-gray-900">{item.label}</p>
              <div className="flex items-center justify-center gap-1 mt-1">
                <span className="text-blue-500 text-xs">✓</span>
                <span className="text-xs text-gray-500">Verified</span>
              </div>
            </div>
          ))}
        </div>

        <div className="flex gap-2 mb-8 justify-center">
          {[
            { key: 'apply', label: '🪪 Apply for Badge' },
            { key: 'lookup', label: '🔍 Lookup Badge' },
          ].map(tab => (
            <button
              key={tab.key}
              onClick={() => { setActiveTab(tab.key as any); setResult(null); setError(null); }}
              className={"px-6 py-3 rounded-xl text-sm font-medium transition-colors " + (
                activeTab === tab.key ? 'bg-black text-white' : 'bg-white border border-gray-300 text-gray-700 hover:bg-gray-50'
              )}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {activeTab === 'apply' && (
          <div className="bg-white border border-gray-200 rounded-2xl p-8">
            <h3 className="font-semibold text-gray-900 mb-6">Apply for Identity Badge</h3>

            {error && (
              <div className="p-4 bg-red-50 border border-red-200 rounded-xl text-red-600 text-sm mb-6">{error}</div>
            )}

            {result?.type === 'apply' && (
              <div className="p-6 bg-green-50 border border-green-200 rounded-xl mb-6 text-center">
                <div className="text-4xl mb-3">🎉</div>
                <p className="font-bold text-green-900 text-lg mb-2">Application Submitted!</p>
                <p className="text-green-700 text-sm mb-3">Your badge application is under review.</p>
                <p className="font-mono text-sm text-green-800 bg-white px-4 py-2 rounded-lg inline-block">
                  {result.data.badge_id}
                </p>
                <p className="text-xs text-green-600 mt-3">Save this Badge ID — use it to check your status</p>
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Full Name *</label>
                <input type="text" value={form.fullName} onChange={e => setForm(p => ({ ...p, fullName: e.target.value }))}
                  placeholder="Your full name" className="w-full px-4 py-3 border border-gray-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-black" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Email *</label>
                <input type="email" value={form.userEmail} onChange={e => setForm(p => ({ ...p, userEmail: e.target.value }))}
                  placeholder="your@email.com" className="w-full px-4 py-3 border border-gray-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-black" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Organization</label>
                <input type="text" value={form.organization} onChange={e => setForm(p => ({ ...p, organization: e.target.value }))}
                  placeholder="Company or institution name" className="w-full px-4 py-3 border border-gray-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-black" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Website</label>
                <input type="text" value={form.website} onChange={e => setForm(p => ({ ...p, website: e.target.value }))}
                  placeholder="https://yourwebsite.com" className="w-full px-4 py-3 border border-gray-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-black" />
              </div>
            </div>

            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-3">Badge Type *</label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {BADGE_TYPES.map(badge => (
                  <button
                    key={badge.value}
                    onClick={() => setForm(p => ({ ...p, badgeType: badge.value }))}
                    className={"p-4 border rounded-xl text-left transition-all " + (
                      form.badgeType === badge.value
                        ? 'border-black bg-black text-white'
                        : 'border-gray-200 hover:border-gray-400'
                    )}
                  >
                    <p className="text-sm font-medium">{badge.label}</p>
                    <p className={"text-xs mt-0.5 " + (form.badgeType === badge.value ? 'text-gray-300' : 'text-gray-500')}>
                      {badge.desc}
                    </p>
                  </button>
                ))}
              </div>
            </div>

            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">Verification Method *</label>
              <select value={form.verificationMethod} onChange={e => setForm(p => ({ ...p, verificationMethod: e.target.value }))}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-black bg-white">
                <option value="">Select verification method</option>
                {VERIFICATION_METHODS.map(m => <option key={m.value} value={m.value}>{m.label}</option>)}
              </select>
            </div>

            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">Verification Details</label>
              <textarea
                value={form.verificationData}
                onChange={e => setForm(p => ({ ...p, verificationData: e.target.value }))}
                placeholder="Provide any additional details to support your verification (license numbers, links, etc.)"
                rows={3}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-black resize-none"
              />
            </div>

            <div className="p-4 bg-blue-50 border border-blue-200 rounded-xl mb-6">
              <p className="text-sm text-blue-800 font-medium mb-1">Review process</p>
              <p className="text-sm text-blue-700">
                Applications are reviewed within 24-48 hours. You will receive an email once your badge is approved.
                Verified badges appear on your profile and certificates.
              </p>
            </div>

            <button onClick={handleApply} disabled={loading}
              className="w-full py-3 bg-black text-white rounded-xl text-sm font-medium hover:bg-gray-800 transition-colors disabled:opacity-50">
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Submitting application...
                </span>
              ) : 'Apply for Identity Badge'}
            </button>
          </div>
        )}

        {activeTab === 'lookup' && (
          <div className="bg-white border border-gray-200 rounded-2xl p-8">
            <h3 className="font-semibold text-gray-900 mb-6">Look up a Badge</h3>

            {error && (
              <div className="p-4 bg-red-50 border border-red-200 rounded-xl text-red-600 text-sm mb-6">{error}</div>
            )}

            <div className="space-y-4 mb-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Badge ID</label>
                <input type="text" value={lookupId} onChange={e => setLookupId(e.target.value)}
                  placeholder="UBADGE-XXXXXXXXXXXX" className="w-full px-4 py-3 border border-gray-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-black font-mono" />
              </div>
              <div className="text-center text-gray-400 text-sm">— or —</div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Email Address</label>
                <input type="email" value={lookupEmail} onChange={e => setLookupEmail(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && handleLookup()}
                  placeholder="user@email.com" className="w-full px-4 py-3 border border-gray-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-black" />
              </div>
            </div>

            <button onClick={handleLookup} disabled={loading}
              className="w-full py-3 bg-black text-white rounded-xl text-sm font-medium hover:bg-gray-800 transition-colors disabled:opacity-50 mb-6">
              {loading ? 'Looking up...' : 'Lookup Badge'}
            </button>

            {result?.type === 'lookup' && !result.data.found && (
              <div className="p-4 bg-gray-50 border border-gray-200 rounded-xl text-center">
                <p className="text-gray-700 font-medium">No badge found</p>
                <p className="text-gray-500 text-sm mt-1">{result.data.message}</p>
              </div>
            )}

            {result?.type === 'lookup' && result.data.found && (
              <div className="border border-gray-200 rounded-xl p-6">
                <div className="flex items-center gap-4 mb-6">
                  <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center text-2xl">
                    {BADGE_TYPES.find(b => b.value === result.data.badge.badge_type)?.label.split(' ')[0] || '🪪'}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <p className="font-bold text-gray-900 text-lg">{result.data.badge.full_name}</p>
                      {result.data.badge.is_verified && (
                        <span className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center text-white text-xs font-bold">✓</span>
                      )}
                    </div>
                    <p className="text-gray-500 text-sm capitalize">{result.data.badge.badge_type}</p>
                    {result.data.badge.organization && (
                      <p className="text-gray-600 text-sm">{result.data.badge.organization}</p>
                    )}
                  </div>
                  <span className={"px-3 py-1 rounded-full text-xs font-medium " + (
                    result.data.badge.is_verified
                      ? 'bg-blue-100 text-blue-700'
                      : 'bg-amber-100 text-amber-700'
                  )}>
                    {result.data.badge.is_verified ? '✓ Verified' : '⏳ Pending'}
                  </span>
                </div>

                <div className="space-y-3 text-sm">
                  <div className="flex justify-between py-2 border-b border-gray-50">
                    <span className="text-gray-500">Badge ID</span>
                    <span className="font-mono text-blue-600">{result.data.badge.badge_id}</span>
                  </div>
                  {result.data.badge.website && (
                    <div className="flex justify-between py-2 border-b border-gray-50">
                      <span className="text-gray-500">Website</span>
                      <span
                        onClick={() => window.open(result.data.badge.website, '_blank')}
                        className="text-blue-600 cursor-pointer hover:underline"
                      >
                        {result.data.badge.website}
                      </span>
                    </div>
                  )}
                  <div className="flex justify-between py-2 border-b border-gray-50">
                    <span className="text-gray-500">Applied</span>
                    <span className="font-medium">{new Date(result.data.badge.created_at).toLocaleDateString()}</span>
                  </div>
                  {result.data.badge.verified_at && (
                    <div className="flex justify-between py-2">
                      <span className="text-gray-500">Verified</span>
                      <span className="font-medium text-blue-600">{new Date(result.data.badge.verified_at).toLocaleDateString()}</span>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </main>
  );
}