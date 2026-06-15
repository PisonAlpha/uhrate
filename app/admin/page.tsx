'use client';

import { useState, useEffect } from 'react';

function getRatingStyle(rating: string) {
  switch (rating) {
    case 'Verified Original':
    case 'Likely Original':
      return 'bg-green-100 text-green-800';
    case 'Mixed Content':
    case 'AI Assisted':
      return 'bg-amber-100 text-amber-800';
    case 'AI Generated':
    case 'Deepfake Suspected':
    case 'High Risk':
      return 'bg-red-100 text-red-800';
    default:
      return 'bg-gray-100 text-gray-800';
  }
}

export default function Admin() {
  const [secret, setSecret] = useState('');
  const [authenticated, setAuthenticated] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [data, setData] = useState<any>(null);
  const [activeTab, setActiveTab] = useState('overview');
  const [badges, setBadges] = useState<any[]>([]);
  const [badgeLoading, setBadgeLoading] = useState(false);
  const [badgeMessage, setBadgeMessage] = useState<string | null>(null);

  const login = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch('/api/admin/stats', {
        headers: { 'x-admin-secret': secret },
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error);
      setData(result);
      setAuthenticated(true);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const fetchBadges = async () => {
    setBadgeLoading(true);
    try {
      const response = await fetch('/api/admin/badges', {
        headers: { 'x-admin-secret': secret },
      });
      const result = await response.json();
      if (result.badges) setBadges(result.badges);
    } catch {
    } finally {
      setBadgeLoading(false);
    }
  };

  const approveBadge = async (badgeId: string) => {
    try {
      const response = await fetch('/api/identity/verify-badge', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ badgeId, adminSecret: secret }),
      });
      const result = await response.json();
      if (result.success) {
        setBadgeMessage('Badge ' + badgeId + ' approved successfully!');
        fetchBadges();
      } else {
        setBadgeMessage('Failed: ' + result.error);
      }
    } catch {
      setBadgeMessage('Failed to approve badge.');
    }
  };

  useEffect(() => {
    if (authenticated && activeTab === 'badges') {
      fetchBadges();
    }
  }, [authenticated, activeTab]);

  if (!authenticated) {
    return (
      <main className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
        <div className="w-full max-w-md">
          <div className="text-center mb-8">
            <div className="w-12 h-12 bg-black rounded-xl flex items-center justify-center mx-auto mb-4">
              <span className="text-white font-bold">UH</span>
            </div>
            <h1 className="text-2xl font-bold text-gray-900">Admin Panel</h1>
            <p className="text-gray-500 text-sm mt-2">Enter your admin secret to continue</p>
          </div>
          <div className="bg-white border border-gray-200 rounded-2xl p-8 space-y-4">
            {error && (
              <div className="p-4 bg-red-50 border border-red-200 rounded-xl text-red-600 text-sm">
                {error}
              </div>
            )}
            <input
              type="password"
              value={secret}
              onChange={e => setSecret(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && login()}
              placeholder="Admin secret"
              className="w-full px-4 py-3 border border-gray-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-black"
            />
            <button
              onClick={login}
              disabled={loading}
              className="w-full py-3 bg-black text-white rounded-xl text-sm font-medium hover:bg-gray-800 transition-colors disabled:opacity-50"
            >
              {loading ? 'Authenticating...' : 'Enter Admin Panel'}
            </button>
          </div>
        </div>
      </main>
    );
  }

  const { stats, recentVerifications, recentUsers, recentPayments } = data;

  return (
    <main className="min-h-screen bg-gray-50">
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              onClick={() => window.location.href = '/'}
              className="flex items-center gap-3 bg-transparent border-0 cursor-pointer p-0"
            >
              <div className="w-8 h-8 bg-black rounded-lg flex items-center justify-center">
                <span className="text-white text-xs font-bold">UH</span>
              </div>
              <span className="font-semibold text-gray-900">UHRATE</span>
            </button>
            <span className="text-gray-400">/</span>
            <span className="text-gray-600 text-sm">Admin</span>
          </div>
          <button
            onClick={() => setAuthenticated(false)}
            className="px-4 py-2 border border-gray-300 text-gray-700 rounded-xl text-sm font-medium hover:bg-gray-50 transition-colors"
          >
            Logout
          </button>
        </div>
      </header>

      <div className="max-w-6xl mx-auto px-6 py-10">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900">Admin Dashboard</h1>
          <p className="text-gray-500 text-sm mt-1">Full platform overview</p>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
          {[
            { label: 'Total Verifications', value: stats.totalVerifications, color: 'text-gray-900' },
            { label: 'Total Users', value: stats.totalUsers, color: 'text-blue-600' },
            { label: 'Pro Users', value: stats.proUsers, color: 'text-purple-600' },
            { label: 'Enterprise Users', value: stats.enterpriseUsers, color: 'text-amber-600' },
            { label: 'Verified Original', value: stats.verifiedOriginal, color: 'text-green-600' },
            { label: 'High Risk', value: stats.highRisk, color: 'text-red-600' },
            { label: 'AI Generated', value: stats.aiGenerated, color: 'text-amber-600' },
            { label: 'API Keys', value: stats.totalApiKeys, color: 'text-blue-600' },
          ].map(stat => (
            <div key={stat.label} className="bg-white border border-gray-200 rounded-xl p-4">
              <p className={"text-2xl font-bold " + stat.color}>{stat.value}</p>
              <p className="text-xs text-gray-500 mt-1">{stat.label}</p>
            </div>
          ))}
        </div>

        <div className="flex gap-2 mb-6 flex-wrap">
          {['overview', 'verifications', 'users', 'payments', 'badges'].map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={"px-4 py-2 rounded-xl text-sm font-medium transition-colors capitalize " + (
                activeTab === tab
                  ? 'bg-black text-white'
                  : 'bg-white border border-gray-300 text-gray-700 hover:bg-gray-50'
              )}
            >
              {tab === 'badges' ? '🪪 Badges' : tab}
            </button>
          ))}
        </div>

        {activeTab === 'overview' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-white border border-gray-200 rounded-xl p-6">
              <h3 className="font-semibold text-gray-900 mb-4">Recent Verifications</h3>
              <div className="space-y-3">
                {recentVerifications?.slice(0, 5).map((v: any) => (
                  <div key={v.id} className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-900 truncate max-w-40">{v.file_name}</p>
                      <p className="text-xs text-gray-400">{new Date(v.created_at).toLocaleDateString()}</p>
                    </div>
                    <span className={"px-2 py-1 rounded-full text-xs font-medium " + getRatingStyle(v.rating)}>
                      {v.rating}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-white border border-gray-200 rounded-xl p-6">
              <h3 className="font-semibold text-gray-900 mb-4">Recent Users</h3>
              <div className="space-y-3">
                {recentUsers?.slice(0, 5).map((u: any) => (
                  <div key={u.id} className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-900">{u.full_name}</p>
                      <p className="text-xs text-gray-400">{u.email}</p>
                    </div>
                    <span className="px-2 py-1 bg-gray-100 text-gray-700 rounded-full text-xs font-medium capitalize">
                      {u.role}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'verifications' && (
          <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-100">
                    <th className="text-left px-6 py-4 text-xs font-medium text-gray-500">File</th>
                    <th className="text-left px-6 py-4 text-xs font-medium text-gray-500">Rating</th>
                    <th className="text-left px-6 py-4 text-xs font-medium text-gray-500">Trust</th>
                    <th className="text-left px-6 py-4 text-xs font-medium text-gray-500">Certificate</th>
                    <th className="text-left px-6 py-4 text-xs font-medium text-gray-500">Date</th>
                  </tr>
                </thead>
                <tbody>
                  {recentVerifications?.map((v: any) => (
                    <tr key={v.id} className="border-b border-gray-50 hover:bg-gray-50">
                      <td className="px-6 py-4">
                        <p className="text-sm font-medium text-gray-900 max-w-40 truncate">{v.file_name}</p>
                        <p className="text-xs text-gray-400">{v.file_type}</p>
                      </td>
                      <td className="px-6 py-4">
                        <span className={"px-2 py-1 rounded-full text-xs font-medium " + getRatingStyle(v.rating)}>
                          {v.rating}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-sm font-bold text-gray-700">{v.trust_score}/100</span>
                      </td>
                      <td className="px-6 py-4">
                        <span className="font-mono text-xs text-blue-600">{v.certificate_id}</span>
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-xs text-gray-500">{new Date(v.created_at).toLocaleDateString()}</span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {activeTab === 'users' && (
          <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-100">
                    <th className="text-left px-6 py-4 text-xs font-medium text-gray-500">Name</th>
                    <th className="text-left px-6 py-4 text-xs font-medium text-gray-500">Email</th>
                    <th className="text-left px-6 py-4 text-xs font-medium text-gray-500">Role</th>
                    <th className="text-left px-6 py-4 text-xs font-medium text-gray-500">Verified</th>
                    <th className="text-left px-6 py-4 text-xs font-medium text-gray-500">Joined</th>
                  </tr>
                </thead>
                <tbody>
                  {recentUsers?.map((u: any) => (
                    <tr key={u.id} className="border-b border-gray-50 hover:bg-gray-50">
                      <td className="px-6 py-4">
                        <p className="text-sm font-medium text-gray-900">{u.full_name}</p>
                      </td>
                      <td className="px-6 py-4">
                        <p className="text-sm text-gray-600">{u.email}</p>
                      </td>
                      <td className="px-6 py-4">
                        <span className="px-2 py-1 bg-gray-100 text-gray-700 rounded-full text-xs font-medium capitalize">
                          {u.role}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span className={"px-2 py-1 rounded-full text-xs font-medium " + (
                          u.email_verified
                            ? 'bg-green-100 text-green-700'
                            : 'bg-gray-100 text-gray-500'
                        )}>
                          {u.email_verified ? 'Verified' : 'Pending'}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-xs text-gray-500">{new Date(u.created_at).toLocaleDateString()}</span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {activeTab === 'payments' && (
          <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
            {recentPayments?.length === 0 ? (
              <div className="text-center py-20">
                <p className="text-gray-500">No payments yet.</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-gray-100">
                      <th className="text-left px-6 py-4 text-xs font-medium text-gray-500">Email</th>
                      <th className="text-left px-6 py-4 text-xs font-medium text-gray-500">Plan</th>
                      <th className="text-left px-6 py-4 text-xs font-medium text-gray-500">Method</th>
                      <th className="text-left px-6 py-4 text-xs font-medium text-gray-500">Amount</th>
                      <th className="text-left px-6 py-4 text-xs font-medium text-gray-500">Date</th>
                    </tr>
                  </thead>
                  <tbody>
                    {recentPayments?.map((p: any) => (
                      <tr key={p.id} className="border-b border-gray-50 hover:bg-gray-50">
                        <td className="px-6 py-4">
                          <p className="text-sm text-gray-900">{p.user_email}</p>
                        </td>
                        <td className="px-6 py-4">
                          <span className="px-2 py-1 bg-purple-100 text-purple-700 rounded-full text-xs font-medium capitalize">
                            {p.plan}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <span className="text-sm text-gray-600">{p.payment_method}</span>
                        </td>
                        <td className="px-6 py-4">
                          <span className="text-sm font-medium text-gray-900">{p.amount}</span>
                        </td>
                        <td className="px-6 py-4">
                          <span className="text-xs text-gray-500">{new Date(p.created_at).toLocaleDateString()}</span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {activeTab === 'badges' && (
          <div className="space-y-4">
            {badgeMessage && (
              <div className="p-4 bg-green-50 border border-green-200 rounded-xl text-green-700 text-sm">
                {badgeMessage}
              </div>
            )}
            {badgeLoading ? (
              <div className="text-center py-20">
                <div className="w-8 h-8 border-4 border-black border-t-transparent rounded-full animate-spin mx-auto mb-4" />
                <p className="text-gray-500 text-sm">Loading badge applications...</p>
              </div>
            ) : badges.length === 0 ? (
              <div className="text-center py-20 bg-white border border-gray-200 rounded-xl">
                <p className="text-gray-500">No badge applications yet.</p>
              </div>
            ) : (
              <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
                <div className="p-6 border-b border-gray-100 flex items-center justify-between">
                  <h3 className="font-semibold text-gray-900">Badge Applications ({badges.length})</h3>
                  <button onClick={fetchBadges} className="text-sm text-blue-600 hover:underline bg-transparent border-0 cursor-pointer">Refresh</button>
                </div>
                <div className="divide-y divide-gray-50">
                  {badges.map((badge: any) => (
                    <div key={badge.id} className="p-4 sm:p-6">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <p className="font-semibold text-gray-900">{badge.full_name}</p>
                            <span className={"px-2 py-0.5 rounded-full text-xs font-medium " + (
                              badge.is_verified
                                ? 'bg-blue-100 text-blue-700'
                                : 'bg-amber-100 text-amber-700'
                            )}>
                              {badge.is_verified ? '✓ Verified' : '⏳ Pending'}
                            </span>
                          </div>
                          <p className="text-sm text-gray-500">{badge.user_email}</p>
                          <div className="flex flex-wrap gap-3 mt-2 text-xs text-gray-500">
                            <span className="capitalize">🏷️ {badge.badge_type}</span>
                            {badge.organization && <span>🏢 {badge.organization}</span>}
                            {badge.website && <span>🌐 {badge.website}</span>}
                            <span>📋 {badge.verification_method?.replace(/_/g, ' ')}</span>
                          </div>
                          {badge.verification_data && (
                            <p className="text-xs text-gray-400 mt-1 italic">{badge.verification_data}</p>
                          )}
                          <p className="font-mono text-xs text-gray-400 mt-1">{badge.badge_id}</p>
                          <p className="text-xs text-gray-400">Applied: {new Date(badge.created_at).toLocaleDateString()}</p>
                        </div>
                        {!badge.is_verified && (
                          <button
                            onClick={() => approveBadge(badge.badge_id)}
                            className="px-4 py-2 bg-blue-600 text-white rounded-xl text-sm font-medium hover:bg-blue-700 transition-colors whitespace-nowrap"
                          >
                            ✓ Approve Badge
                          </button>
                        )}
                        {badge.is_verified && (
                          <span className="px-4 py-2 bg-green-50 text-green-700 rounded-xl text-sm font-medium whitespace-nowrap">
                            ✓ Approved
                          </span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </main>
  );
}