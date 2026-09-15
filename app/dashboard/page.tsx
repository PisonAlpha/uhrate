'use client';
import Nav from '../components/Nav';
import Footer from '../components/Footer';

import { useEffect, useState } from 'react';
import { SUPPORTED_CHAINS } from '@/lib/registry';

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

function getTrustColor(score: number) {
  if (score >= 70) return 'text-green-600';
  if (score >= 40) return 'text-amber-600';
  return 'text-red-600';
}

function getExplorerUrl(chain: string, txHash: string) {
  const chainData = SUPPORTED_CHAINS.find(c =>
    c.id === chain || c.name.toLowerCase() === chain?.toLowerCase()
  );
  if (!chainData || !txHash) return `https://bscscan.com/tx/${txHash}`;
  return `${chainData.explorer}/tx/${txHash}`;
}

function MiniBar({ value, max, color }: { value: number; max: number; color: string }) {
  const pct = max > 0 ? (value / max) * 100 : 0;
  return (
    <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden flex-1">
      <div className={`h-full rounded-full ${color}`} style={{ width: `${pct}%` }} />
    </div>
  );
}

export default function Dashboard() {
  const [verifications, setVerifications] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [user, setUser] = useState<any>(null);
  const [checkedAuth, setCheckedAuth] = useState(false);
  const [activeTab, setActiveTab] = useState('overview');
  const [dashData, setDashData] = useState<any>(null);

  useEffect(() => {
    const stored = localStorage.getItem('uhrate_user');
    if (stored) {
      const u = JSON.parse(stored);
      setUser(u);
      fetchDashboard(u);
    } else {
      setLoading(false);
    }
    setCheckedAuth(true);
  }, []);

  const fetchDashboard = async (u: any) => {
    try {
      const params = new URLSearchParams();
      if (u.email) params.set('email', u.email);
      if (u.id) params.set('userId', u.id);
      const response = await fetch('/api/dashboard?' + params.toString());
      const data = await response.json();
      if (!response.ok) throw new Error(data.error);
      setVerifications(data.verifications || []);
      setDashData(data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const stats = dashData?.stats || { total: 0, verified: 0, aiGenerated: 0, highRisk: 0, avgTrustScore: 0, nftMinted: 0, totalSpent: 0, deploymentsCount: 0 };

  return (
    <main className="min-h-screen bg-gray-50">
      <header className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button onClick={() => window.location.href = '/'} className="flex items-center gap-3 bg-transparent border-0 cursor-pointer p-0">
              <div className="w-8 h-8 bg-black rounded-lg flex items-center justify-center">
                <span className="text-white text-xs font-bold">UH</span>
              </div>
              <span className="font-semibold text-gray-900">UHRATE</span>
            </button>
            <span className="text-gray-400">/</span>
            <span className="text-gray-600 text-sm">Dashboard</span>
          </div>
          <div className="flex items-center gap-3">
            {user && <span className="text-sm text-gray-500 hidden sm:block">{user.full_name || user.email}</span>}
            <button onClick={() => window.location.href = '/'} className="px-4 py-2 bg-black text-white rounded-xl text-sm font-medium hover:bg-gray-800 transition-colors">
              + Verify File
            </button>
          </div>
        </div>
      </header>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-10">
        {checkedAuth && !user && (
          <div className="bg-white border border-gray-200 rounded-2xl p-8 text-center">
            <div className="text-4xl mb-3">🔒</div>
            <h3 className="font-semibold text-gray-900 text-lg mb-2">Login Required</h3>
            <p className="text-gray-500 text-sm mb-6">Log in to view your personal verification history and analytics.</p>
            <div className="flex gap-3 justify-center">
              <button onClick={() => window.location.href = '/login'} className="px-6 py-3 bg-black text-white rounded-xl text-sm font-medium hover:bg-gray-800 transition-colors">Login</button>
              <button onClick={() => window.location.href = '/register'} className="px-6 py-3 border border-gray-300 text-gray-700 rounded-xl text-sm font-medium hover:bg-gray-50 transition-colors">Sign up free</button>
            </div>
          </div>
        )}

        {user && (
          <>
            <div className="mb-8 flex items-center justify-between flex-wrap gap-4">
              <div>
                <h1 className="text-2xl font-bold text-gray-900">My Dashboard</h1>
                <p className="text-gray-500 text-sm mt-1">
                  {user.wallet_address
                    ? `Wallet: ${user.wallet_address.slice(0, 6)}...${user.wallet_address.slice(-4)}`
                    : user.email}
                </p>
              </div>
              <button
                onClick={() => { localStorage.removeItem('uhrate_user'); window.location.href = '/login'; }}
                className="px-4 py-2 border border-gray-300 text-gray-600 rounded-xl text-sm hover:bg-gray-50 transition-colors"
              >
                Sign Out
              </button>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
              {[
                { label: 'Total Verifications', value: stats.total, color: 'text-gray-900', icon: '🔍' },
                { label: 'Verified Original', value: stats.verified, color: 'text-green-600', icon: '✓' },
                { label: 'Avg Trust Score', value: stats.avgTrustScore + '/100', color: 'text-blue-600', icon: '📊' },
                { label: 'NFTs Minted', value: stats.nftMinted, color: 'text-purple-600', icon: '🏆' },
              ].map(stat => (
                <div key={stat.label} className="bg-white border border-gray-200 rounded-xl p-5">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-lg">{stat.icon}</span>
                  </div>
                  <p className={"text-2xl font-bold " + stat.color}>{stat.value}</p>
                  <p className="text-xs text-gray-500 mt-1">{stat.label}</p>
                </div>
              ))}
            </div>

                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
              {[
                { label: 'AI Detected', value: stats.aiGenerated, color: 'text-amber-600', icon: '🤖' },
                { label: 'High Risk Caught', value: stats.highRisk, color: 'text-red-600', icon: '🛡️' },
                { label: 'On-Chain Protected', value: stats.deploymentsCount, color: 'text-indigo-600', icon: '⛓️' },
                { label: 'Registry Entries', value: dashData?.registryEntries?.length || 0, color: 'text-purple-600', icon: '📋' },
              ].map(stat => (
                <div key={stat.label} className="bg-white border border-gray-200 rounded-xl p-5">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-lg">{stat.icon}</span>
                  </div>
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
                { key: 'analytics', label: '📈 Analytics' },
                { key: 'deployments', label: '⛓️ Deployments' },
                { key: 'registry', label: '📋 Registry' },
              ].map(tab => (
                <button
                  key={tab.key}
                  onClick={() => setActiveTab(tab.key)}
                  className={"px-4 py-2 rounded-xl text-sm font-medium transition-colors " + (
                    activeTab === tab.key ? 'bg-black text-white' : 'bg-white border border-gray-300 text-gray-700 hover:bg-gray-50'
                  )}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            {loading && (
              <div className="text-center py-20">
                <div className="w-8 h-8 border-4 border-black border-t-transparent rounded-full animate-spin mx-auto mb-4" />
                <p className="text-gray-500 text-sm">Loading dashboard...</p>
              </div>
            )}

            {error && (
              <div className="p-4 bg-red-50 border border-red-200 rounded-xl text-red-600 text-sm mb-6">
                {error}
              </div>
            )}

            {/* Overview Tab */}
            {!loading && activeTab === 'overview' && (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Recent Activity */}
                <div className="bg-white border border-gray-200 rounded-xl p-6">
                  <h3 className="font-semibold text-gray-900 mb-4">Recent Verifications</h3>
                  {dashData?.recentActivity?.length === 0 ? (
                    <p className="text-gray-400 text-sm">No verifications yet.</p>
                  ) : (
                    <div className="space-y-3">
                      {dashData?.recentActivity?.map((v: any) => (
                        <div key={v.id} className="flex items-center justify-between gap-3">
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-gray-900 truncate">{v.file_name}</p>
                            <p className="text-xs text-gray-400">{new Date(v.created_at).toLocaleDateString()}</p>
                          </div>
                          <div className="flex items-center gap-2">
                            {v.has_nft && <span className="text-xs text-purple-600">🏆 NFT</span>}
                            <span className={"px-2 py-1 rounded-full text-xs font-medium " + getRatingStyle(v.rating)}>
                              {v.rating}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Rating Breakdown */}
                <div className="bg-white border border-gray-200 rounded-xl p-6">
                  <h3 className="font-semibold text-gray-900 mb-4">Rating Breakdown</h3>
                  {!dashData?.ratingBreakdown?.length ? (
                    <p className="text-gray-400 text-sm">No data yet.</p>
                  ) : (
                    <div className="space-y-3">
                      {dashData?.ratingBreakdown?.map((r: any) => (
                        <div key={r.rating} className="flex items-center gap-3">
                          <span className="text-xs text-gray-600 w-32 flex-shrink-0">{r.rating}</span>
                          <MiniBar value={r.count} max={stats.total} color={
                            r.rating.includes('Original') ? 'bg-green-500' :
                            r.rating.includes('AI') ? 'bg-amber-500' :
                            r.rating.includes('Risk') || r.rating.includes('Deepfake') ? 'bg-red-500' : 'bg-blue-500'
                          } />
                          <span className="text-xs font-bold text-gray-700 w-6 text-right">{r.count}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* File Type Breakdown */}
                <div className="bg-white border border-gray-200 rounded-xl p-6">
                  <h3 className="font-semibold text-gray-900 mb-4">File Types</h3>
                  {!dashData?.fileTypeBreakdown?.length ? (
                    <p className="text-gray-400 text-sm">No data yet.</p>
                  ) : (
                    <div className="space-y-3">
                      {dashData?.fileTypeBreakdown?.map((f: any) => (
                        <div key={f.type} className="flex items-center gap-3">
                          <span className="text-xs text-gray-600 w-16 flex-shrink-0">{f.type}</span>
                          <MiniBar value={f.count} max={stats.total} color="bg-indigo-500" />
                          <span className="text-xs font-bold text-gray-700 w-6 text-right">{f.count}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Quick Actions */}
                <div className="bg-white border border-gray-200 rounded-xl p-6">
                  <h3 className="font-semibold text-gray-900 mb-4">Quick Actions</h3>
                  <div className="space-y-3">
                    {[
                      { label: 'Verify a new file', desc: 'Upload any file for AI verification', href: '/', icon: '🔍' },
                      { label: 'Document Registry', desc: 'Register documents permanently on-chain', href: '/registry', icon: '📋' },
                      { label: 'Education Registry', desc: 'Register academic credentials', href: '/education', icon: '🎓' },
                      { label: 'Identity Badge', desc: 'Apply for a verified identity badge', href: '/identity', icon: '🪪' },
                      { label: 'API Access', desc: 'Integrate UHRATE into your apps', href: '/api-marketplace', icon: '🔧' },
                    ].map(action => (
                      <button
                        key={action.label}
                        onClick={() => window.location.href = action.href}
                        className="w-full flex items-center gap-3 p-3 rounded-xl hover:bg-gray-50 transition-colors text-left bg-transparent border-0 cursor-pointer"
                      >
                        <span className="text-xl">{action.icon}</span>
                        <div>
                          <p className="text-sm font-medium text-gray-900">{action.label}</p>
                          <p className="text-xs text-gray-500">{action.desc}</p>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Verifications Tab */}
            {!loading && activeTab === 'verifications' && (
              <>
                {verifications.length === 0 ? (
                  <div className="text-center py-20 bg-white border border-gray-200 rounded-xl">
                    <p className="text-gray-500 mb-4">No verifications yet.</p>
                    <button onClick={() => window.location.href = '/'} className="px-4 py-2 bg-black text-white rounded-xl text-sm font-medium hover:bg-gray-800 transition-colors">
                      Verify your first file
                    </button>
                  </div>
                ) : (
                  <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
                    <div className="p-4 border-b border-gray-100">
                      <p className="text-sm text-gray-500">{verifications.length} verifications total</p>
                    </div>
                    <div className="overflow-x-auto">
                      <table className="w-full">
                        <thead>
                          <tr className="border-b border-gray-100 bg-gray-50">
                            <th className="text-left px-6 py-3 text-xs font-medium text-gray-500">File</th>
                            <th className="text-left px-6 py-3 text-xs font-medium text-gray-500">Rating</th>
                            <th className="text-left px-6 py-3 text-xs font-medium text-gray-500">Trust</th>
                            <th className="text-left px-6 py-3 text-xs font-medium text-gray-500">Certificate</th>
                            <th className="text-left px-6 py-3 text-xs font-medium text-gray-500">Blockchain</th>
                            <th className="text-left px-6 py-3 text-xs font-medium text-gray-500">Date</th>
                          </tr>
                        </thead>
                        <tbody>
                          {verifications.map((v, i) => (
                            <tr key={v.id} className={"border-b border-gray-50 hover:bg-gray-50 " + (i === verifications.length - 1 ? 'border-0' : '')}>
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
                                <span className={"text-sm font-bold " + getTrustColor(v.trust_score)}>
                                  {v.trust_score}/100
                                </span>
                              </td>
                              <td className="px-6 py-4">
                                <span className="font-mono text-xs text-blue-600">{v.certificate_id}</span>
                              </td>
                              <td className="px-6 py-4">
                                {v.blockchain_tx ? (
                                  <a
                                    href={getExplorerUrl(v.blockchain_chain, v.blockchain_tx)}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="font-mono text-xs text-blue-600 hover:underline max-w-32 truncate block"
                                  >
                                    {v.blockchain_tx.slice(0, 12)}...
                                  </a>
                                ) : (
                                  <span className="text-xs text-gray-400">Not deployed</span>
                                )}
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
              </>
            )}

            {/* Analytics Tab */}
            {!loading && activeTab === 'analytics' && (
              <div className="space-y-6">
                <div className="bg-white border border-gray-200 rounded-xl p-6">
                  <h3 className="font-semibold text-gray-900 mb-6">Activity — Last 30 Days</h3>
                  {!dashData?.activityByDay?.length ? (
                    <p className="text-gray-400 text-sm">No activity in the last 30 days.</p>
                  ) : (
                    <div className="flex items-end gap-1 h-32">
                      {dashData?.activityByDay?.map((d: any) => {
                        const max = Math.max(...dashData.activityByDay.map((x: any) => x.count));
                        const height = max > 0 ? (d.count / max) * 100 : 0;
                        return (
                          <div key={d.date} className="flex-1 flex flex-col items-center gap-1 group relative">
                            <div
                              className="w-full bg-black rounded-t-sm transition-all hover:bg-gray-700"
                              style={{ height: `${height}%`, minHeight: d.count > 0 ? '4px' : '0' }}
                            />
                            <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-black text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-10">
                              {d.count} on {d.date}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <div className="bg-white border border-gray-200 rounded-xl p-6">
                    <h3 className="font-semibold text-gray-900 mb-4">Trust Score Distribution</h3>
                    <div className="space-y-3">
                      {[
                        { label: 'High (70-100)', count: verifications.filter(v => v.trust_score >= 70).length, color: 'bg-green-500' },
                        { label: 'Medium (40-69)', count: verifications.filter(v => v.trust_score >= 40 && v.trust_score < 70).length, color: 'bg-amber-500' },
                        { label: 'Low (0-39)', count: verifications.filter(v => v.trust_score < 40).length, color: 'bg-red-500' },
                      ].map(item => (
                        <div key={item.label} className="flex items-center gap-3">
                          <span className="text-xs text-gray-600 w-28 flex-shrink-0">{item.label}</span>
                          <MiniBar value={item.count} max={stats.total} color={item.color} />
                          <span className="text-xs font-bold text-gray-700 w-6 text-right">{item.count}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="bg-white border border-gray-200 rounded-xl p-6">
                    <h3 className="font-semibold text-gray-900 mb-4">Platform Summary</h3>
                    <div className="space-y-3">
                      {[
                        { label: 'Originality Rate', value: stats.total > 0 ? Math.round((stats.verified / stats.total) * 100) + '%' : '0%' },
                        { label: 'AI Detection Rate', value: stats.total > 0 ? Math.round((stats.aiGenerated / stats.total) * 100) + '%' : '0%' },
                        { label: 'High Risk Rate', value: stats.total > 0 ? Math.round((stats.highRisk / stats.total) * 100) + '%' : '0%' },
                        { label: 'Blockchain Deployment Rate', value: stats.total > 0 ? Math.round((stats.nftMinted / stats.total) * 100) + '%' : '0%' },
                        { label: 'Average Trust Score', value: stats.avgTrustScore + '/100' },
                      ].map(item => (
                        <div key={item.label} className="flex justify-between py-2 border-b border-gray-50">
                          <span className="text-sm text-gray-500">{item.label}</span>
                          <span className="text-sm font-bold text-gray-900">{item.value}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Deployments Tab */}
            {!loading && activeTab === 'deployments' && (
              <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
                                <div className="p-6 border-b border-gray-100">
                  <h3 className="font-semibold text-gray-900">⛓ On-Chain Protected Documents</h3>
                  <p className="text-xs text-gray-500 mt-1">{stats.deploymentsCount} document{stats.deploymentsCount !== 1 ? 's' : ''} permanently secured on the blockchain</p>
                </div>
                {!dashData?.deployments?.length ? (
                                    <div className="text-center py-20">
                    <div className="text-4xl mb-4">⛓</div>
                    <p className="text-gray-700 font-semibold mb-2">No documents protected on-chain yet</p>
                    <p className="text-xs text-gray-400 mb-6 max-w-xs mx-auto">Give your verified documents a permanent, immutable blockchain identity. Verifiable by anyone, anywhere, forever.</p>
                    <button onClick={() => window.location.href = '/registry'} className="px-6 py-3 bg-black text-white rounded-xl text-sm font-medium hover:bg-gray-800 transition-colors">
                      Protect a Document →
                    </button>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b border-gray-100 bg-gray-50">
                          <th className="text-left px-6 py-3 text-xs font-medium text-gray-500">Chain</th>
                          <th className="text-left px-6 py-3 text-xs font-medium text-gray-500">Transaction</th>
    
                          <th className="text-left px-6 py-3 text-xs font-medium text-gray-500">Date</th>
                        </tr>
                      </thead>
                      <tbody>
                        {dashData?.deployments?.map((p: any) => (
                          <tr key={p.id} className="border-b border-gray-50 hover:bg-gray-50">
                            <td className="px-6 py-4">
                              <span className="px-2 py-1 bg-gray-100 text-gray-700 rounded-lg text-xs font-medium uppercase">
                                {p.payment_method}
                              </span>
                            </td>
                            <td className="px-6 py-4">
                              <a
                                href={getExplorerUrl(p.payment_method, p.tx_hash)}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="font-mono text-xs text-blue-600 hover:underline"
                              >
                                {p.tx_hash?.slice(0, 20)}...
                              </a>
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

            {/* Registry Tab */}
            {!loading && activeTab === 'registry' && (
              <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
                <div className="p-6 border-b border-gray-100 flex items-center justify-between">
                  <h3 className="font-semibold text-gray-900">Registered Documents</h3>
                  <button onClick={() => window.location.href = '/registry'} className="px-4 py-2 bg-black text-white rounded-xl text-sm font-medium hover:bg-gray-800 transition-colors">
                    + Register Document
                  </button>
                </div>
                {!dashData?.registryEntries?.length ? (
                  <div className="text-center py-20">
                    <p className="text-gray-500 text-sm mb-3">No documents registered yet.</p>
                    <div className="flex gap-3 justify-center flex-wrap">
                      {['/registry', '/education', '/legal', '/media'].map(href => (
                        <button key={href} onClick={() => window.location.href = href} className="px-4 py-2 border border-gray-200 text-gray-600 rounded-xl text-sm hover:bg-gray-50 transition-colors capitalize">
                          {href.replace('/', '')} Registry
                        </button>
                      ))}
                    </div>
                  </div>
                ) : (
                  <div className="divide-y divide-gray-50">
                    {dashData?.registryEntries?.map((r: any) => (
                      <div key={r.id} className="p-4 flex items-center justify-between">
                        <div>
                          <p className="text-sm font-medium text-gray-900 capitalize">{r.document_type}</p>
                          <p className="text-xs text-gray-400">{new Date(r.created_at).toLocaleDateString()}</p>
                        </div>
                        {r.chain_name && (
                          <span className="px-2 py-1 bg-gray-100 text-gray-600 rounded-lg text-xs font-medium">
                            {r.chain_name}
                          </span>
                        )}
                      </div>
                    ))}
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