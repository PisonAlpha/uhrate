import { useState } from 'react';
import { Text, Pressable } from 'react-native';
import { useRouter } from 'expo-router';
import { useAuth } from '@/context/AuthContext';
import { errorMessage } from '@/services/api';
import { Button } from '@/components/button';
import { ErrorMessage } from '@/components/error-message';
import { Screen } from '@/components/screen';
import { TextField } from '@/components/text-field';
import { authStyles } from '@/components/auth-styles';
import { useColors } from '@/theme';

export default function Login() {
  const { login } = useAuth();
  const router = useRouter();
  const colors = useColors();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleLogin = async () => {
    if (!email || !password) {
      setError('Please enter your email and password.');
      return;
    }
    setLoading(true);
    setError(null);
    try {
      // Calls POST /api/auth/login with the existing, unchanged {email, password} contract.
      await login(email, password);
      // No navigation here: the route guards move the now signed-in user
      // into the app area.
    } catch (err) {
      setError(errorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <Screen style={authStyles.container}>
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
        placeholder="you@example.com"
        editable={!loading}
      />

      <TextField
        label="Password"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
        placeholder="Enter your password"
        editable={!loading}
      />

      <Button title="Sign in" onPress={handleLogin} loading={loading} style={authStyles.submit} />

      <Pressable onPress={() => router.push('/register')} disabled={loading}>
        <Text style={[authStyles.link, { color: colors.text }]}>Don&apos;t have an account? Create one free</Text>
      </Pressable>
    </Screen>
  );
}
