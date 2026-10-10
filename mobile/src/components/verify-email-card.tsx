import { useEffect, useState } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { sendVerificationEmail } from '@/services/auth';
import { ApiError, errorMessage } from '@/services/api';
import { Button } from '@/components/button';
import { Card } from '@/components/card';
import { ErrorMessage } from '@/components/error-message';
import { useColors } from '@/theme';

// Wait before allowing another resend, so repeated taps don't flood the inbox.
const RESEND_COOLDOWN_MS = 60_000;

interface VerifyEmailCardProps {
  email: string;
  /**
   * Reloads the profile and resolves to whether the email is now verified,
   * or null if the profile could not be loaded.
   */
  onCheckAgain: () => Promise<boolean | null>;
}

// Reminder shown while the account's email is unverified. Unverified users
// can still use the app, as on the website.
export function VerifyEmailCard({ email, onCheckAgain }: VerifyEmailCardProps) {
  const colors = useColors();
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);
  const [checking, setChecking] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!sent) return;
    const timer = setTimeout(() => setSent(false), RESEND_COOLDOWN_MS);
    return () => clearTimeout(timer);
  }, [sent]);

  const checkAgain = async () => {
    setChecking(true);
    setError(null);
    const verified = await onCheckAgain();
    setChecking(false);
    if (verified === null) setError("Couldn't check right now. Please try again.");
    else if (!verified) setError('Not verified yet. Tap the link in the email first, then try again.');
  };

  const resend = async () => {
    setSending(true);
    setError(null);
    try {
      await sendVerificationEmail(email);
      setSent(true);
    } catch (err) {
      // The email is always sent, so a 400 means it is already verified:
      // reload the profile so the card goes away.
      if (err instanceof ApiError && err.status === 400) {
        await onCheckAgain();
        return;
      }
      setError(errorMessage(err));
    } finally {
      setSending(false);
    }
  };

  return (
    <Card>
      <Text style={[styles.title, { color: colors.text }]}>Verify your email</Text>
      <Text style={[styles.body, { color: colors.textMuted }]}>
        We sent a verification link to <Text style={{ color: colors.text, fontWeight: '600' }}>{email}</Text>. Tap
        the link to verify your account. It expires in 24 hours.
      </Text>

      {sent && (
        <Text style={[styles.sent, { color: colors.success }]}>Email sent. Check your inbox and spam folder.</Text>
      )}
      {error && <ErrorMessage message={error} />}

      <View style={styles.actions}>
        <Button title="I've verified" onPress={checkAgain} loading={checking} disabled={sending} />
        <Button
          title={sent ? 'Email sent' : 'Resend email'}
          variant="secondary"
          onPress={resend}
          loading={sending}
          disabled={sent || checking}
        />
      </View>
    </Card>
  );
}

const styles = StyleSheet.create({
  title: { fontSize: 16, fontWeight: '700', marginBottom: 8 },
  body: { fontSize: 14, lineHeight: 20, marginBottom: 16 },
  sent: { fontSize: 13, marginBottom: 16 },
  actions: { gap: 12 },
});
