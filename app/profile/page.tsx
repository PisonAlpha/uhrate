'use client';

import { useState, useEffect } from 'react';

export default function Profile() {
  const [user, setUser] = useState<any>(null);
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [checkedAuth, setCheckedAuth] = useState(false);
  const [changing, setChanging] = useState(false);
  const [passwordForm, setPasswordForm] = useState({ current: '', newPass: '', confirm: '' });
  const [passwordError, setPasswordError] = useState<string | null>(null);
  const [passwordSuccess, setPasswordSuccess] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem('uhrate_user');
    if (stored) {
      const u = JSON.parse(stored);
      setUser(u);
      fetchProfile(u.email);
    } else {
      setLoading(false);
    }
    setCheckedAuth(true);
  }, []);

  const fetchProfile = async (email: string) => {
    try {
      const response = await fetch('/api/profile?email=' + encodeURIComponent(email));
      const data = await response.json();
      if (data.success) setProfile(data.user);
    } catch {
    } finally {
      setLoading(false);
    }
  };

  const handleChangePassword = async () => {
    if (!passwordForm.current || !passwordForm.newPass || !passwordForm.confirm) {
      setPasswordError('Please fill in all fields');
      return;
    }
    if (passwordForm.newPass !== passwordForm.confirm) {
      setPasswordError('New passwords do not match');
      return;
    }
    if (passwordForm.newPass.length < 6) {
      setPasswordError('Password must be at least 6 characters');
      return;
    }

    setChanging(true);
    setPasswordError(null);

    try {
      const response = await fetch('/api/profile/change-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: user.email,
          currentPassword: passwordForm.current,
          newPassword: passwordForm.newPass,
        }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error);
      setPasswordSuccess(true);
      setPasswordForm({ current: '', newPass: '', confirm: '' });
    } catch (err: any) {
      setPasswordError(err.message);
    } finally {
      setChanging(false);
    }
  };

  const getPlanColor = (role: string) => {
    switch (role) {
      case 'enterprise': return 'bg-amber-100 text-amber-700';
      case 'pro': return 'bg-purple-100 text-purple-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  const getPlanLabel = (role: string) => {
    switch (role) {
      case 'enterprise': return '🏢 Enterprise';
      case 'pro': return '⭐ Pro';
      default: return '🆓 Free';
    }
  };

  return (
    <main className="min-h-screen bg-gray-50">
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-2xl mx-auto px-4 sm:px-6 py-4 flex items-center justify-between">
          <button onClick={() => window.location.href = '/'} className="flex items-center gap-3 bg-transparent border-0 cursor-pointer p-0">
            <div className="w-8 h-8 bg-black rounded-lg flex items-center justify-center">
              <span className="text-white text-xs font-bold">UH</span>
            </div>
            <span className="font-semibold text-gray-900">UHRATE</span>
          </button>
          <span className="text-sm text-gray-500 font-medium">My Profile</span>
        </div>
      </header>

      <div className="max-w-2xl mx-auto px-4 sm:px-6 py-12">
        {checkedAuth && !user && (
          <div className="bg-white border border-gray-200 rounded-2xl p-8 text-center">
            <div className="text-4xl mb-3">🔒</div>
            <h3 className="font-semibold text-gray-900 text-lg mb-2">Login Required</h3>
            <p className="text-gray-500 text-sm mb-6">Please log in to view your profile.</p>
            <div className="flex gap-3 justify-center">
              <button onClick={() => window.location.href = '/login'} className="px-6 py-3 bg-black text-white rounded-xl text-sm font-medium hover:bg-gray-800 transition-colors">Login</button>
              <button onClick={() => window.location.href = '/register'} className="px-6 py-3 border border-gray-300 text-gray-700 rounded-xl text-sm font-medium hover:bg-gray-50 transition-colors">Sign up free</button>
            </div>
          </div>
        )}

        {user && loading && (
          <div className="text-center py-20">
            <div className="w-8 h-8 border-4 border-black border-t-transparent rounded-full animate-spin mx-auto mb-4" />
            <p className="text-gray-500 text-sm">Loading profile...</p>
          </div>
        )}

        {user && !loading && profile && (
          <div className="space-y-6">
            <div className="bg-white border border-gray-200 rounded-2xl p-6">
              <div className="flex items-center gap-4 mb-6">
                <div className="w-16 h-16 bg-black rounded-full flex items-center justify-center">
                  <span className="text-white text-xl font-bold">
                    {profile.full_name?.charAt(0).toUpperCase()}
                  </span>
                </div>
                <div>
                  <h2 className="font-bold text-gray-900 text-xl">{profile.full_name}</h2>
                  <p className="text-gray-500 text-sm">{profile.email}</p>
                  <div className="flex items-center gap-2 mt-1">
                    <span className={"px-2 py-0.5 rounded-full text-xs font-medium " + getPlanColor(profile.role)}>
                      {getPlanLabel(profile.role)}
                    </span>
                    {profile.email_verified && (
                      <span className="px-2 py-0.5 bg-green-100 text-green-700 rounded-full text-xs font-medium">
                        ✓ Email Verified
                      </span>
                    )}
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="bg-gray-50 rounded-xl p-4">
                  <p className="text-xs text-gray-500 mb-1">Plan</p>
                  <p className="font-semibold text-gray-900 capitalize">{profile.role}</p>
                </div>
                <div className="bg-gray-50 rounded-xl p-4">
                  <p className="text-xs text-gray-500 mb-1">Credits Remaining</p>
                  <p className="font-semibold text-gray-900">
                    {profile.role === 'individual' ? (profile.credits || 0) + ' / 10' : 'Unlimited'}
                  </p>
                </div>
                <div className="bg-gray-50 rounded-xl p-4">
                  <p className="text-xs text-gray-500 mb-1">Plan Expires</p>
                  <p className="font-semibold text-gray-900">
                    {profile.plan_expires_at
                      ? new Date(profile.plan_expires_at).toLocaleDateString()
                      : profile.role === 'individual' ? 'N/A' : 'N/A'}
                  </p>
                </div>
                <div className="bg-gray-50 rounded-xl p-4">
                  <p className="text-xs text-gray-500 mb-1">Member Since</p>
                  <p className="font-semibold text-gray-900">{new Date(profile.created_at).toLocaleDateString()}</p>
                </div>
              </div>

              {profile.role === 'individual' && (
                <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-xl">
                  <p className="text-sm text-blue-800 font-medium mb-1">Upgrade your plan</p>
                  <p className="text-sm text-blue-700 mb-3">Get unlimited verifications, NFT certificates, and API access.</p>
                  <button onClick={() => window.location.href = '/pricing'} className="px-4 py-2 bg-black text-white rounded-xl text-sm font-medium hover:bg-gray-800 transition-colors">
                    View Plans
                  </button>
                </div>
              )}
            </div>

            <div className="bg-white border border-gray-200 rounded-2xl p-6">
              <h3 className="font-semibold text-gray-900 mb-6">Change Password</h3>

              {passwordSuccess && (
                <div className="p-4 bg-green-50 border border-green-200 rounded-xl text-green-700 text-sm mb-6">
                  Password changed successfully!
                </div>
              )}

              {passwordError && (
                <div className="p-4 bg-red-50 border border-red-200 rounded-xl text-red-600 text-sm mb-6">
                  {passwordError}
                </div>
              )}

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Current Password</label>
                  <input
                    type="password"
                    value={passwordForm.current}
                    onChange={e => setPasswordForm(p => ({ ...p, current: e.target.value }))}
                    placeholder="Enter current password"
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-black"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">New Password</label>
                  <input
                    type="password"
                    value={passwordForm.newPass}
                    onChange={e => setPasswordForm(p => ({ ...p, newPass: e.target.value }))}
                    placeholder="Enter new password"
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-black"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Confirm New Password</label>
                  <input
                    type="password"
                    value={passwordForm.confirm}
                    onChange={e => setPasswordForm(p => ({ ...p, confirm: e.target.value }))}
                    placeholder="Confirm new password"
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-black"
                  />
                </div>
                <button
                  onClick={handleChangePassword}
                  disabled={changing}
                  className="w-full py-3 bg-black text-white rounded-xl text-sm font-medium hover:bg-gray-800 transition-colors disabled:opacity-50"
                >
                  {changing ? 'Changing password...' : 'Change Password'}
                </button>
              </div>
            </div>

            <div className="bg-white border border-gray-200 rounded-2xl p-6">
              <h3 className="font-semibold text-gray-900 mb-4">Quick Links</h3>
              <div className="grid grid-cols-2 gap-3">
                {[
                  { label: '📊 My Dashboard', href: '/dashboard' },
                  { label: '💰 Upgrade Plan', href: '/pricing' },
                  { label: '🔑 API Keys', href: '/api-marketplace' },
                  { label: '🪪 Identity Badge', href: '/identity' },
                ].map(item => (
                  <button
                    key={item.label}
                    onClick={() => window.location.href = item.href}
                    className="p-3 border border-gray-200 rounded-xl text-sm text-gray-700 hover:bg-gray-50 transition-colors text-left"
                  >
                    {item.label}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}