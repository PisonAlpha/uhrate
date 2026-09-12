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
  const [searchQuery, setSearchQuery] = useState('');

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
        setBadgeMessage('✓ Badge ' + badgeId + ' approved successfully!');
        fetchBadges();
      } else {
        setBadgeMessage('Failed: ' + result.error);
      }
    } catch {
      setBadgeMessage('Failed to approve badge.');
    }
  };

  const rejectBadge = async (badgeId: string) => {
    if (!confirm('Are you sure you want to reject this badge application?')) return;
    try {
      const response = await fetch('/api/admin/badges', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          'x-admin-secret': secret,
        },
        body: JSON.stringify({ badgeId }),
      });
      const result = await response.json();
      if (result.success) {
        setBadgeMessage('✗ Badge ' + badgeId + ' rejected and removed.');
        fetchBadges();
      } else {
        setBadgeMessage('Failed to reject: ' + result.error);
      }
    } catch {
      setBadgeMessage('Failed to reject badge.');
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

  const filteredUsers = recentUsers?.filter((u: any) =>
    u.full_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    u.email?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredVerifications = recentVerifications?.filter((v: any) =>
    v.file_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    v.certificate_id?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const totalRevenue = recentPayments?.reduce((sum: number, p: any) => sum + (p.fee_usd || 0.50), 0) || 0;
  const pendingBadges = badges.filter(b => !b.is_verified).length;

  return (
    <main className="min-h-screen bg-gray-50">
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button onClick={() => window.location.href = '/'} className="flex items-center gap-3 bg-transparent border-0 cursor-pointer p-0">
              <div className="w-8 h-8 bg-black rounded-lg flex items-center justify-center">
                <span className="text-white text-xs font-bold">UH</span>
              </div>
              <span className="font-semibold text-gray-900">UHRATE</span>
            </button>
            <span className="text-gray-400">/</span>
            <span className="text-gray-600 text-sm">Admin</span>
          </div>
          <div className="flex items-center gap-3">
            {pendingBadges > 0 && (
              <span className="px-3 py-1 bg-amber-100 text-amber-700 rounded-full text-xs font-bold">
                {pendingBadges} badge{pendingBadges > 1 ? 's' : ''} pending
              </span>
            )}
            <button onClick={() => setAuthenticated(false)} className="px-4 py-2 border border-gray-300 text-gray-700 rounded-xl text-sm font-medium hover:bg-gray-50 transition-colors">
              Logout
            </button>
          </div>
        </div>
      </header>

      <div className="max-w-6xl mx-auto px-6 py-10">
        <div className="mb-8 flex items-center justify-between flex-wrap gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Admin Dashboard</h1>
            <p className="text-gray-500 text-sm mt-1">Full platform overview — UHRATE</p>
          </div>
          <input
            type="text"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            placeholder="Search users, files, certificates..."
            className="px-4 py-2 border border-gray-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-black w-72"
          />
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
          {[
            { label: 'Total Verifications', value: stats.totalVerifications, color: 'text-gray-900', bg: 'bg-white' },
            { label: 'Total Users', value: stats.totalUsers, color: 'text-blue-600', bg: 'bg-white' },
            { label: 'Verified Original', value: stats.verifiedOriginal, color: 'text-green-600', bg: 'bg-white' },
            { label: 'High Risk', value: stats.highRisk, color: 'text-red-600', bg: 'bg-white' },
            { label: 'AI Generated', value: stats.aiGenerated, color: 'text-amber-600', bg: 'bg-white' },
            { label: 'API Keys', value: stats.totalApiKeys, color: 'text-blue-600', bg: 'bg-white' },
            { label: 'Blockchain Deployments', value: recentPayments?.length || 0, color: 'text-purple-600', bg: 'bg-white' },
            { label: 'Platform Revenue', value: '$' + totalRevenue.toFixed(2), color: 'text-green-600', bg: 'bg-green-50' },
          ].map(stat => (
            <div key={stat.label} className={`${stat.bg} border border-gray-200 rounded-xl p-4`}>
              <p className={"text-2xl font-bold " + stat.color}>{stat.value}</p>
              <p className="text-xs text-gray-500 mt-1">{stat.label}</p>
            </div>
          ))}
        </div>

        {/* Tabs */}
        <div className="flex gap-2 mb-6 flex-wrap">
          {[
            { key: 'overview', label: '📊 Overview' },
            { key: 'verifications', label: '🔍 Verifications' },
            { key: 'users', label: '👥 Users' },
            { key: 'payments', label: '💰 Deployments' },
            { key: 'badges', label: `🪪 Badges${pendingBadges > 0 ? ` (${pendingBadges})` : ''}` },
          ].map(tab => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
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

        {/* Overview Tab */}
        {activeTab === 'overview' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-white border border-gray-200 rounded-xl p-6">
              <h3 className="font-semibold text-gray-900 mb-4">Recent Verifications</h3>
              <div className="space-y-3">
                {recentVerifications?.slice(0, 5).map((v: any) => (
                  <div key={v.id} className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-900 truncate max-w-48">{v.file_name}</p>
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
            <div className="bg-white border border-gray-200 rounded-xl p-6">
              <h3 className="font-semibold text-gray-900 mb-4">Recent Blockchain Deployments</h3>
              {recentPayments?.length === 0 ? (
                <p className="text-gray-400 text-sm">No deployments yet.</p>
              ) : (
                <div className="space-y-3">
                  {recentPayments?.slice(0, 5).map((p: any) => (
                    <div key={p.id} className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-gray-900">{p.user_email}</p>
                        <p className="text-xs text-gray-400 uppercase">{p.payment_method} chain</p>
                      </div>
                      <span className="px-2 py-1 bg-green-100 text-green-700 rounded-full text-xs font-bold">
                        $0.50
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
            <div className="bg-white border border-gray-200 rounded-xl p-6">
              <h3 className="font-semibold text-gray-900 mb-4">Platform Health</h3>
              <div className="space-y-4">
                {[
                  { label: 'Verification Rate', value: stats.totalVerifications > 0 ? '100%' : '0%', color: 'bg-green-500' },
                  { label: 'Original Content', value: stats.totalVerifications > 0 ? Math.round((stats.verifiedOriginal / stats.totalVerifications) * 100) + '%' : '0%', color: 'bg-blue-500' },
                  { label: 'High Risk Rate', value: stats.totalVerifications > 0 ? Math.round((stats.highRisk / stats.totalVerifications) * 100) + '%' : '0%', color: 'bg-red-500' },
                  { label: 'AI Generated Rate', value: stats.totalVerifications > 0 ? Math.round((stats.aiGenerated / stats.totalVerifications) * 100) + '%' : '0%', color: 'bg-amber-500' },
                ].map(item => (
                  <div key={item.label}>
                    <div className="flex justify-between mb-1">
                      <span className="text-xs text-gray-600">{item.label}</span>
                      <span className="text-xs font-bold text-gray-900">{item.value}</span>
                    </div>
                    <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                      <div className={`h-full rounded-full ${item.color}`} style={{ width: item.value }} />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Verifications Tab */}
        {activeTab === 'verifications' && (
          <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
            <div className="p-4 border-b border-gray-100">
              <p className="text-sm text-gray-500">{filteredVerifications?.length || 0} verifications</p>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-100 bg-gray-50">
                    <th className="text-left px-6 py-3 text-xs font-medium text-gray-500">File</th>
                    <th className="text-left px-6 py-3 text-xs font-medium text-gray-500">Rating</th>
                    <th className="text-left px-6 py-3 text-xs font-medium text-gray-500">Trust</th>
                    <th className="text-left px-6 py-3 text-xs font-medium text-gray-500">Certificate</th>
                    <th className="text-left px-6 py-3 text-xs font-medium text-gray-500">Date</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredVerifications?.map((v: any) => (
                    <tr key={v.id} className="border-b border-gray-50 hover:bg-gray-50">
                      <td className="px-6 py-4">
                        <p className="text-sm font-medium text-gray-900 max-w-48 truncate">{v.file_name}</p>
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

        {/* Users Tab */}
        {activeTab === 'users' && (
          <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
            <div className="p-4 border-b border-gray-100">
              <p className="text-sm text-gray-500">{filteredUsers?.length || 0} users</p>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-100 bg-gray-50">
                    <th className="text-left px-6 py-3 text-xs font-medium text-gray-500">Name</th>
                    <th className="text-left px-6 py-3 text-xs font-medium text-gray-500">Email</th>
                    <th className="text-left px-6 py-3 text-xs font-medium text-gray-500">Role</th>
                    <th className="text-left px-6 py-3 text-xs font-medium text-gray-500">Verified</th>
                    <th className="text-left px-6 py-3 text-xs font-medium text-gray-500">Joined</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredUsers?.map((u: any) => (
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
                          u.email_verified ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'
                        )}>
                          {u.email_verified ? '✓ Verified' : 'Pending'}
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

        {/* Payments/Deployments Tab */}
        {activeTab === 'payments' && (
          <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
            <div className="p-4 border-b border-gray-100 flex items-center justify-between">
              <p className="text-sm text-gray-500">{recentPayments?.length || 0} blockchain deployments</p>
              <span className="text-sm font-bold text-green-600">Total: ${totalRevenue.toFixed(2)}</span>
            </div>
            {recentPayments?.length === 0 ? (
              <div className="text-center py-20">
                <p className="text-gray-500">No blockchain deployments yet.</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-gray-100 bg-gray-50">
                      <th className="text-left px-6 py-3 text-xs font-medium text-gray-500">User</th>
                      <th className="text-left px-6 py-3 text-xs font-medium text-gray-500">Chain</th>
                      <th className="text-left px-6 py-3 text-xs font-medium text-gray-500">Tx Hash</th>
                      <th className="text-left px-6 py-3 text-xs font-medium text-gray-500">Fee</th>
                      <th className="text-left px-6 py-3 text-xs font-medium text-gray-500">Date</th>
                    </tr>
                  </thead>
                  <tbody>
                    {recentPayments?.map((p: any) => (
                      <tr key={p.id} className="border-b border-gray-50 hover:bg-gray-50">
                        <td className="px-6 py-4">
                          <p className="text-sm text-gray-900">{p.user_email}</p>
                        </td>
                        <td className="px-6 py-4">
                          <span className="px-2 py-1 bg-purple-100 text-purple-700 rounded-full text-xs font-medium uppercase">
                            {p.payment_method}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <span className="font-mono text-xs text-blue-600 truncate max-w-32 block">
                            {p.tx_hash?.slice(0, 20)}...
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <span className="text-sm font-bold text-green-600">$0.50</span>
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

        {/* Badges Tab */}
        {activeTab === 'badges' && (
          <div className="space-y-4">
            {badgeMessage && (
              <div className={"p-4 rounded-xl text-sm border " + (
                badgeMessage.startsWith('✓')
                  ? 'bg-green-50 border-green-200 text-green-700'
                  : 'bg-red-50 border-red-200 text-red-700'
              )}>
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
                <p className="text-2xl mb-3">🪪</p>
                <p className="text-gray-500">No badge applications yet.</p>
              </div>
            ) : (
              <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
                <div className="p-6 border-b border-gray-100 flex items-center justify-between">
                  <div>
                    <h3 className="font-semibold text-gray-900">Badge Applications ({badges.length})</h3>
                    <p className="text-xs text-gray-500 mt-1">
                      {badges.filter(b => !b.is_verified).length} pending · {badges.filter(b => b.is_verified).length} approved
                    </p>
                  </div>
                  <button onClick={fetchBadges} className="text-sm text-blue-600 hover:underline bg-transparent border-0 cursor-pointer">
                    Refresh
                  </button>
                </div>
                <div className="divide-y divide-gray-50">
                  {badges.map((badge: any) => (
                    <div key={badge.id} className={"p-4 sm:p-6 " + (!badge.is_verified ? 'bg-amber-50/30' : '')}>
                      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1 flex-wrap">
                            <p className="font-semibold text-gray-900">{badge.full_name}</p>
                            <span className={"px-2 py-0.5 rounded-full text-xs font-medium " + (
                              badge.is_verified
                                ? 'bg-green-100 text-green-700'
                                : 'bg-amber-100 text-amber-700'
                            )}>
                              {badge.is_verified ? '✓ Approved' : '⏳ Pending Review'}
                            </span>
                          </div>
                          <p className="text-sm text-gray-500 mb-2">{badge.user_email}</p>
                          <div className="flex flex-wrap gap-3 mb-2 text-xs text-gray-500">
                            <span className="capitalize font-medium">🏷️ {badge.badge_type}</span>
                            {badge.organization && <span>🏢 {badge.organization}</span>}
                            {badge.website && (
                              <a href={badge.website} target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:underline">
                                🌐 {badge.website}
                              </a>
                            )}
                            <span>📋 {badge.verification_method?.replace(/_/g, ' ')}</span>
                          </div>
                          {badge.verification_data && (
                            <p className="text-xs text-gray-500 bg-gray-50 rounded-lg p-2 mb-2 italic">
                              "{badge.verification_data}"
                            </p>
                          )}
                          <div className="flex gap-3 text-xs text-gray-400">
                            <span className="font-mono">{badge.badge_id}</span>
                            <span>Applied: {new Date(badge.created_at).toLocaleDateString()}</span>
                          </div>
                        </div>
                        {!badge.is_verified && (
                          <div className="flex gap-2 flex-shrink-0">
                            <button
                              onClick={() => approveBadge(badge.badge_id)}
                              className="px-4 py-2 bg-green-600 text-white rounded-xl text-sm font-medium hover:bg-green-700 transition-colors"
                            >
                              ✓ Approve
                            </button>
                            <button
                              onClick={() => rejectBadge(badge.badge_id)}
                              className="px-4 py-2 bg-red-50 text-red-600 border border-red-200 rounded-xl text-sm font-medium hover:bg-red-100 transition-colors"
                            >
                              ✗ Reject
                            </button>
                          </div>
                        )}
                        {badge.is_verified && (
                          <span className="px-4 py-2 bg-green-50 text-green-700 border border-green-200 rounded-xl text-sm font-medium whitespace-nowrap flex-shrink-0">
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