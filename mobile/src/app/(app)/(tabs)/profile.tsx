import { useRef, useState } from 'react';
import { View, Text, ActivityIndicator, RefreshControl, StyleSheet, type TextInput } from 'react-native';
import { useAuth } from '@/context/AuthContext';
import { useProfile } from '@/hooks/use-profile';
import { changePassword } from '@/services/auth';
import { errorMessage } from '@/services/api';
import { creditsLabel, formatDate, planLabel } from '@/lib/format';
import { BrandHeader } from '@/components/brand-header';
import { Button } from '@/components/button';
import { Card } from '@/components/card';
import { ErrorMessage } from '@/components/error-message';
import { Pill } from '@/components/pill';
import { Screen } from '@/components/screen';
import { TextField } from '@/components/text-field';
import { useColors } from '@/theme';

// Profile (roadmap D19): account details from /api/profile, change password,
// and logout.
export default function Profile() {
  const colors = useColors();
  const { user, logout } = useAuth();
  const { profile, loading, error, reload } = useProfile();
  const [refreshing, setRefreshing] = useState(false);

  const refresh = async () => {
    setRefreshing(true);
    await reload();
    setRefreshing(false);
  };

  const account = profile ?? user;
  const initial = (account?.full_name || account?.email || '?').charAt(0).toUpperCase();

  return (
    <Screen
      muted
      form
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={refresh}
          tintColor={colors.textMuted}
          colors={[colors.primary]}
          progressBackgroundColor={colors.card}
        />
      }
    >
      <View style={styles.header}>
        <BrandHeader />
      </View>
      <Text style={[styles.title, { color: colors.text }]}>Profile</Text>

      <Card style={styles.section}>
        <View style={styles.identity}>
          <View style={[styles.avatar, { backgroundColor: colors.primary }]}>
            <Text style={[styles.avatarText, { color: colors.onPrimary }]}>{initial}</Text>
          </View>
          <View style={styles.identityText}>
            <Text style={[styles.name, { color: colors.text }]} numberOfLines={1}>
              {account?.full_name || '—'}
            </Text>
            <Text style={[styles.email, { color: colors.textMuted }]} numberOfLines={1}>
              {account?.email || '—'}
            </Text>
          </View>
        </View>

        {loading && !profile ? (
          <ActivityIndicator color={colors.primary} style={styles.loading} />
        ) : error && !profile ? (
          <View style={styles.loading}>
            <ErrorMessage message={error} />
          </View>
        ) : profile ? (
          <>
            <View style={styles.pills}>
              <Pill label={planLabel(profile.role)} style={styles.inlinePill} />
              {profile.email_verified && <Pill label="✓ Email verified" tone="success" style={styles.inlinePill} />}
            </View>

            <DetailRow label="Plan" value={planLabel(profile.role)} />
            <DetailRow label="Credits remaining" value={creditsLabel(profile)} />
            <DetailRow label="Plan expires" value={formatDate(profile.plan_expires_at)} />
            <DetailRow label="Member since" value={formatDate(profile.created_at)} />
          </>
        ) : null}
      </Card>

      <ChangePasswordCard />

      <Button title="Logout" variant="danger" onPress={() => logout()} />
    </Screen>
  );
}

function DetailRow({ label, value }: { label: string; value: string }) {
  const colors = useColors();
  return (
    <View style={[styles.detailRow, { borderTopColor: colors.border }]}>
      <Text style={[styles.detailLabel, { color: colors.textMuted }]}>{label}</Text>
      <Text style={[styles.detailValue, { color: colors.text }]}>{value}</Text>
    </View>
  );
}

function ChangePasswordCard() {
  const colors = useColors();
  const newRef = useRef<TextInput>(null);
  const confirmRef = useRef<TextInput>(null);
  const [current, setCurrent] = useState('');
  const [next, setNext] = useState('');
  const [confirm, setConfirm] = useState('');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleSave = async () => {
    setSuccess(false);
    if (!current || !next || !confirm) {
      setError('Please fill in all fields.');
      return;
    }
    if (next !== confirm) {
      setError('New passwords do not match.');
      return;
    }
    // Same minimum as registration.
    if (next.length < 8) {
      setError('New password must be at least 8 characters.');
      return;
    }
    if (next === current) {
      setError('New password must be different from your current password.');
      return;
    }
    setSaving(true);
    setError(null);
    try {
      await changePassword(current, next);
      setSuccess(true);
      setCurrent('');
      setNext('');
      setConfirm('');
    } catch (err) {
      setError(errorMessage(err));
    } finally {
      setSaving(false);
    }
  };

  return (
    <Card style={styles.section}>
      <Text style={[styles.cardTitle, { color: colors.text }]}>Change password</Text>

      {success && (
        <Text style={[styles.success, { color: colors.success }]}>Password changed successfully.</Text>
      )}
      {error && (
        <View style={styles.formError}>
          <ErrorMessage message={error} />
        </View>
      )}

      <TextField
        label="Current password"
        value={current}
        onChangeText={setCurrent}
        secureTextEntry
        autoComplete="current-password"
        textContentType="password"
        returnKeyType="next"
        submitBehavior="submit"
        onSubmitEditing={() => newRef.current?.focus()}
        placeholder="Enter current password"
        editable={!saving}
      />
      <TextField
        ref={newRef}
        label="New password"
        value={next}
        onChangeText={setNext}
        secureTextEntry
        autoComplete="new-password"
        textContentType="newPassword"
        returnKeyType="next"
        submitBehavior="submit"
        onSubmitEditing={() => confirmRef.current?.focus()}
        placeholder="At least 8 characters"
        editable={!saving}
      />
      <TextField
        ref={confirmRef}
        label="Confirm new password"
        value={confirm}
        onChangeText={setConfirm}
        secureTextEntry
        autoComplete="new-password"
        textContentType="newPassword"
        returnKeyType="go"
        onSubmitEditing={handleSave}
        placeholder="Re-enter new password"
        editable={!saving}
      />

      <Button title="Update password" onPress={handleSave} loading={saving} style={styles.cardButton} />
    </Card>
  );
}

const styles = StyleSheet.create({
  header: { marginBottom: 24 },
  title: { fontSize: 26, fontWeight: '700', marginBottom: 16 },
  section: { marginBottom: 16 },
  identity: { flexDirection: 'row', alignItems: 'center', gap: 14 },
  avatar: { width: 52, height: 52, borderRadius: 26, justifyContent: 'center', alignItems: 'center' },
  avatarText: { fontSize: 20, fontWeight: '700' },
  identityText: { flex: 1 },
  name: { fontSize: 18, fontWeight: '700' },
  email: { fontSize: 14, marginTop: 2 },
  loading: { marginTop: 16 },
  pills: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: 16, marginBottom: 4 },
  inlinePill: { marginTop: 0 },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingTop: 12,
    marginTop: 12,
    borderTopWidth: 1,
  },
  detailLabel: { fontSize: 14 },
  detailValue: { fontSize: 14, fontWeight: '600' },
  cardTitle: { fontSize: 16, fontWeight: '700' },
  success: { fontSize: 13, marginTop: 12 },
  formError: { marginTop: 12 },
  cardButton: { marginTop: 20 },
});
