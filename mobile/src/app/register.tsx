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

export default function Register() {
  const { register } = useAuth();
  const router = useRouter();
  const colors = useColors();
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleRegister = async () => {
    if (!fullName || !email || !password || !confirm) {
      setError('Please fill in all fields.');
      return;
    }
    if (password !== confirm) {
      setError('Passwords do not match.');
      return;
    }
    if (password.length < 8) {
      setError('Password must be at least 8 characters.');
      return;
    }
    setLoading(true);
    setError(null);
    try {
      // Calls POST /api/auth/register with the existing, unchanged
      // {email, password, full_name} contract — nothing added or removed.
      await register(email, password, fullName);
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
      <Text style={[authStyles.title, { color: colors.text }]}>Create your account</Text>
      <Text style={[authStyles.subtitle, { color: colors.textMuted }]}>Join UHRATE — free to start</Text>

      {error && <ErrorMessage message={error} />}

      <TextField label="Full name" value={fullName} onChangeText={setFullName} placeholder="Jane Doe" editable={!loading} />

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
        placeholder="At least 8 characters"
        editable={!loading}
      />

      <TextField
        label="Confirm password"
        value={confirm}
        onChangeText={setConfirm}
        secureTextEntry
        placeholder="Re-enter your password"
        editable={!loading}
      />

      <Button title="Create account" onPress={handleRegister} loading={loading} style={authStyles.submit} />

      <Pressable onPress={() => router.push('/login')} disabled={loading}>
        <Text style={[authStyles.link, { color: colors.text }]}>Already have an account? Sign in</Text>
      </Pressable>
    </Screen>
  );
}
