import { useRef, useState } from 'react';
import { Text, Pressable, StyleSheet, type TextInput } from 'react-native';
import { useRouter } from 'expo-router';
import { useAuth } from '@/context/AuthContext';
import { ApiError, errorMessage } from '@/services/api';
import { walletLoginMessage, walletNonceRequest } from '@/services/auth';
import { isValidEmail } from '@/lib/validation';
import { Button } from '@/components/button';
import { ErrorMessage } from '@/components/error-message';
import { Screen } from '@/components/screen';
import { TextField } from '@/components/text-field';
import { authStyles } from '@/components/auth-styles';
import { useColors } from '@/theme';
import { useWallet, walletErrorMessage } from '@/wallet/use-wallet';

export default function Login() {
  const { login, walletLogin } = useAuth();
  const wallet = useWallet();
  const router = useRouter();
  const colors = useColors();
  const passwordRef = useRef<TextInput>(null);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [walletLoading, setWalletLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleLogin = async () => {
    // Passwords are sent exactly as typed; only the email is trimmed.
    const trimmedEmail = email.trim();
    if (!trimmedEmail || !password) {
      setError('Please enter your email and password.');
      return;
    }
    if (!isValidEmail(trimmedEmail)) {
      setError('Please enter a valid email address.');
      return;
    }
    setLoading(true);
    setError(null);
    try {
      // Calls POST /api/auth/login with the existing, unchanged {email, password} contract.
      await login(trimmedEmail, password);
      // No navigation here: the route guards move the now signed-in user
      // into the app area.
    } catch (err) {
      setError(errorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  // Same steps as the web: connect, get a nonce, sign it, exchange the
  // signature for a token. A new wallet gets a new account.
  const handleWalletLogin = async () => {
    setWalletLoading(true);
    setError(null);
    try {
      const walletAddress = await wallet.connect();
      const { nonce } = await walletNonceRequest(walletAddress);
      const message = walletLoginMessage(walletAddress, nonce);
      const signature = await wallet.signMessage(message);
      await walletLogin(walletAddress, signature, message);
    } catch (err) {
      setError(err instanceof ApiError ? errorMessage(err) : walletErrorMessage(err));
    } finally {
      setWalletLoading(false);
    }
  };

  const busy = loading || walletLoading;

  return (
    <Screen form style={authStyles.container}>
      <Text style={[authStyles.title, { color: colors.text }]}>Welcome back</Text>
      <Text style={[authStyles.subtitle, { color: colors.textMuted }]}>Sign in to your UHRATE account</Text>

      {error && <ErrorMessage message={error} />}

      <TextField
        label="Email address"
        value={email}
        onChangeText={setEmail}
        autoCapitalize="none"
        autoCorrect={false}
        keyboardType="email-address"
        autoComplete="email"
        textContentType="emailAddress"
        returnKeyType="next"
        submitBehavior="submit"
        onSubmitEditing={() => passwordRef.current?.focus()}
        placeholder="you@example.com"
        editable={!busy}
      />

      <TextField
        ref={passwordRef}
        label="Password"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
        autoComplete="current-password"
        textContentType="password"
        returnKeyType="go"
        onSubmitEditing={handleLogin}
        placeholder="Enter your password"
        editable={!busy}
      />

      <Button title="Sign in" onPress={handleLogin} loading={loading} disabled={walletLoading} style={authStyles.submit} />

      <Text style={[styles.or, { color: colors.textMuted }]}>or</Text>
      <Button
        title="Continue with wallet"
        variant="secondary"
        onPress={handleWalletLogin}
        loading={walletLoading}
        disabled={loading}
      />

      <Pressable onPress={() => router.push('/register')} disabled={busy}>
        <Text style={[authStyles.link, { color: colors.text }]}>Don&apos;t have an account? Create one free</Text>
      </Pressable>
    </Screen>
  );
}

const styles = StyleSheet.create({
  or: { fontSize: 13, textAlign: 'center', marginVertical: 12 },
});
