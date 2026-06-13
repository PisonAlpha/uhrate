'use client';

import { useState, useEffect } from 'react';

export default function APIMarketplace() {
  const [email, setEmail] = useState('');
  const [keyName, setKeyName] = useState('');
  const [keys, setKeys] = useState<any[]>([]);
  const [newKey, setNewKey] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'docs' | 'keys'>('docs');
  const [user, setUser] = useState<any>(null);
  const [checkedAuth, setCheckedAuth] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem('uhrate_user');
    if (stored) {
      const u = JSON.parse(stored);
      setUser(u);
      setEmail(u.email);
      fetchKeys(u.email);
    }
    setCheckedAuth(true);
  }, []);

  const fetchKeys = async (userEmail: string) => {
    try {
      const response = await fetch('/api/developer/keys?email=' + userEmail);
      const data = await response.json();
      if (data.success) setKeys(data.keys);
    } catch (err) {
      console.error('Failed to fetch keys');
    }
  };

  const generateKey = async () => {
    if (!email || !keyName) {
      setError('Please fill in all fields');
      return;
    }
    setLoading(true);
    setError(null);
    setNewKey(null);

    try {
      const response = await fetch('/api/developer/generate-key', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, keyName }),
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.error);

      setNewKey(data.api_key);
      setKeyName('');
      fetchKeys(email);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const deleteKey = async (keyId: string) => {
    try {
      await fetch('/api/developer/keys?id=' + keyId + '&email=' + email, {
        method: 'DELETE',
      });
      fetchKeys(email);
    } catch (err) {
      console.error('Failed to delete key');
    }
  };

  const endpoints = [
    {
      method: 'POST',
      path: '/api/verify',
      description: 'Verify a file for authenticity',
      body: 'multipart/form-data with file field',
      response: '{ success, data: { certificate_id, rating, trust_score, ... }, analysis }',
    },
    {
      method: 'GET',
      path: '/api/certificate?id=CERT_ID',
      description: 'Look up a certificate by ID',
      body: 'None',
      response: '{ success, certificate: { id, rating, scores, blockchain_tx, ... } }',
    },
    {
      method: 'POST',
      path: '/api/verify-public',
      description: 'Public verification by hash or certificate ID',
      body: '{ certificateId } or { hash }',
      response: '{ found, verification: { ... } }',
    },
    {
      method: 'POST',
      path: '/api/enterprise/bulk-verify',
      description: 'Verify up to 20 files at once',
      body: 'multipart/form-data with files[] field',
      response: '{ success, total, successful, failed, results: [...] }',
    },
  ];

  return (
    <main className="min-h-screen bg-gray-50">
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 py-4 flex items-center justify-between">
          <button
            onClick={() => window.location.href = '/'}
            className="flex items-center gap-3 bg-transparent border-0 cursor-pointer p-0"
          >
            <div className="w-8 h-8 bg-black rounded-lg flex items-center justify-center">
              <span className="text-white text-xs font-bold">UH</span>
            </div>
            <span className="font-semibold text-gray-900">UHRATE</span>
          </button>
          <span className="text-sm text-gray-500 font-medium">API Marketplace</span>
        </div>
      </header>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8 sm:py-12">
        {checkedAuth && !user && (
          <div className="bg-white border border-gray-200 rounded-2xl p-8 text-center mb-8">
            <div className="text-4xl mb-3">🔒</div>
            <h3 className="font-semibold text-gray-900 text-lg mb-2">Login Required</h3>
            <p className="text-gray-500 text-sm mb-6">
              Create a free account to access the API marketplace and generate API keys.
            </p>
            <div className="flex gap-3 justify-center">
              <button onClick={() => window.location.href = '/login'} className="px-6 py-3 bg-black text-white rounded-xl text-sm font-medium hover:bg-gray-800 transition-colors">Login</button>
              <button onClick={() => window.location.href = '/register'} className="px-6 py-3 border border-gray-300 text-gray-700 rounded-xl text-sm font-medium hover:bg-gray-50 transition-colors">Sign up free</button>
            </div>
          </div>
        )}
        {user && (
        <>
        <div className="mb-10">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            UHRATE API
          </h1>
          <p className="text-gray-500">
            Integrate UHRATE authenticity verification into your own applications.
          </p>
        </div>

        <div className="flex gap-2 mb-8">
          {[
            { key: 'docs', label: 'Documentation' },
            { key: 'keys', label: 'API Keys' },
          ].map(tab => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key as any)}
              className={"px-4 py-2 rounded-xl text-sm font-medium transition-colors " + (
                activeTab === tab.key
                  ? 'bg-black text-white'
                  : 'bg-white border border-gray-300 text-gray-700 hover:bg-gray-50'
              )}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {activeTab === 'docs' && (
          <div className="space-y-6">
            <div className="bg-white border border-gray-200 rounded-2xl p-4 sm:p-6">
              <h3 className="font-semibold text-gray-900 mb-4">Base URL</h3>
              <div className="bg-gray-900 rounded-xl p-4 font-mono text-green-400 text-sm overflow-x-auto">
                https://uhrate.xyz
              </div>
            </div>

            <div className="bg-white border border-gray-200 rounded-2xl p-4 sm:p-6">
              <h3 className="font-semibold text-gray-900 mb-4">Authentication</h3>
              <p className="text-gray-500 text-sm mb-4">
                Include your API key in the request header:
              </p>
              <div className="bg-gray-900 rounded-xl p-4 font-mono text-green-400 text-sm overflow-x-auto">
                {`x-api-key: uhr_your_api_key_here`}
              </div>
            </div>

            <div className="bg-white border border-gray-200 rounded-2xl p-4 sm:p-6">
              <h3 className="font-semibold text-gray-900 mb-6">Endpoints</h3>
              <div className="space-y-6">
                {endpoints.map((endpoint, i) => (
                  <div key={i} className="border border-gray-100 rounded-xl p-4 sm:p-5">
                    <div className="flex items-center gap-3 mb-3 flex-wrap">
                      <span className={"px-2 py-1 rounded text-xs font-bold " + (
                        endpoint.method === 'GET'
                          ? 'bg-blue-100 text-blue-700'
                          : 'bg-green-100 text-green-700'
                      )}>
                        {endpoint.method}
                      </span>
                      <span className="font-mono text-sm text-gray-900 break-all">{endpoint.path}</span>
                    </div>
                    <p className="text-sm text-gray-600 mb-3">{endpoint.description}</p>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <p className="text-xs font-medium text-gray-500 mb-1">Request Body</p>
                        <div className="bg-gray-50 rounded-lg p-3 font-mono text-xs text-gray-600 break-all">
                          {endpoint.body}
                        </div>
                      </div>
                      <div>
                        <p className="text-xs font-medium text-gray-500 mb-1">Response</p>
                        <div className="bg-gray-50 rounded-lg p-3 font-mono text-xs text-gray-600 break-all">
                          {endpoint.response}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-white border border-gray-200 rounded-2xl p-4 sm:p-6">
              <h3 className="font-semibold text-gray-900 mb-4">Example — Verify a file</h3>
              <div className="bg-gray-900 rounded-xl p-4 font-mono text-green-400 text-sm overflow-x-auto">
                <pre>{`const formData = new FormData();
formData.append('file', fileInput.files[0]);

const response = await fetch('https://uhrate.xyz/api/verify', {
  method: 'POST',
  headers: { 'x-api-key': 'uhr_your_key' },
  body: formData,
});

const result = await response.json();
console.log(result.data.rating);
// "Verified Original"`}</pre>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'keys' && (
          <div className="space-y-6">
            <div className="bg-white border border-gray-200 rounded-2xl p-4 sm:p-6">
              <h3 className="font-semibold text-gray-900 mb-4">Generate API Key</h3>

              {newKey && (
                <div className="p-4 bg-green-50 border border-green-200 rounded-xl mb-4">
                  <p className="text-sm font-medium text-green-900 mb-2">
                    Your new API key — save it now, it won't be shown again:
                  </p>
                  <p className="font-mono text-sm text-green-800 break-all bg-white p-3 rounded-lg border border-green-200">
                    {newKey}
                  </p>
                </div>
              )}

              {error && (
                <div className="p-4 bg-red-50 border border-red-200 rounded-xl text-red-600 text-sm mb-4">
                  {error}
                </div>
              )}

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
                  <input
                    type="email"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    placeholder="your@email.com"
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-black"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Key Name</label>
                  <input
                    type="text"
                    value={keyName}
                    onChange={e => setKeyName(e.target.value)}
                    placeholder="e.g. My App Production"
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-black"
                  />
                </div>
                <button
                  onClick={generateKey}
                  disabled={loading}
                  className="w-full py-3 bg-black text-white rounded-xl text-sm font-medium hover:bg-gray-800 transition-colors disabled:opacity-50"
                >
                  {loading ? 'Generating...' : 'Generate API Key'}
                </button>
              </div>
            </div>

            {keys.length > 0 && (
              <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden">
                <div className="p-4 sm:p-6 border-b border-gray-100">
                  <h3 className="font-semibold text-gray-900">Your API Keys</h3>
                </div>
                <div className="divide-y divide-gray-50">
                  {keys.map(key => (
                    <div key={key.id} className="p-4 flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4">
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900">{key.key_name}</p>
                        <p className="font-mono text-xs text-gray-500 mt-0.5 break-all">{key.api_key}</p>
                        <p className="text-xs text-gray-400 mt-1">
                          {key.calls_used}/{key.calls_limit} calls used
                        </p>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className={"px-2 py-1 rounded-full text-xs font-medium " + (
                          key.is_active
                            ? 'bg-green-100 text-green-700'
                            : 'bg-gray-100 text-gray-500'
                        )}>
                          {key.is_active ? 'Active' : 'Inactive'}
                        </span>
                        <button
                          onClick={() => deleteKey(key.id)}
                          className="text-red-500 text-xs hover:underline"
                        >
                          Revoke
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
        </>
        )}
      </div>
    </main>
  );
}