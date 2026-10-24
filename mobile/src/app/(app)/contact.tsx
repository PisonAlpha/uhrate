import { useRef, useState } from 'react';
import { Text, StyleSheet, type TextInput } from 'react-native';
import { useRouter } from 'expo-router';
import { useAuth } from '@/context/AuthContext';
import { api, errorMessage } from '@/services/api';
import { isValidEmail } from '@/lib/validation';
import { Button } from '@/components/button';
import { Card } from '@/components/card';
import { ErrorMessage } from '@/components/error-message';
import { PageHeader } from '@/components/page-header';
import { Screen } from '@/components/screen';
import { TextField } from '@/components/text-field';
import { useColors } from '@/theme';

// Contact (roadmap D35), opened from More. Matches the web's /contact page:
// a message to the UHRATE team through /api/contact (public, no token).
// Name and email start from the signed-in user's profile.
export default function ContactScreen() {
  const router = useRouter();
  const colors = useColors();
  const { user } = useAuth();
  const [name, setName] = useState(user?.full_name ?? '');
  // Wallet sign-ins may not have a real email, so only a valid one is filled in.
  const [email, setEmail] = useState(user?.email && isValidEmail(user.email) ? user.email : '');
  const [company, setCompany] = useState('');
  const [message, setMessage] = useState('');
  const [errors, setErrors] = useState<{ name?: string; email?: string; message?: string }>({});
  const [error, setError] = useState<string | null>(null);
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);
  const emailInput = useRef<TextInput>(null);
  const companyInput = useRef<TextInput>(null);
  const messageInput = useRef<TextInput>(null);

  const handleSend = async () => {
    const trimmed = { name: name.trim(), email: email.trim(), company: company.trim(), message: message.trim() };
    setName(trimmed.name);
    setEmail(trimmed.email);
    setCompany(trimmed.company);
    setMessage(trimmed.message);

    const fieldErrors = {
      name: trimmed.name ? undefined : 'Required',
      email: !trimmed.email ? 'Required' : isValidEmail(trimmed.email) ? undefined : 'Enter a valid email address',
      message: trimmed.message ? undefined : 'Required',
    };
    setErrors(fieldErrors);
    if (Object.values(fieldErrors).some(Boolean)) {
      setError('Please fill in your name, email, and message.');
      return;
    }

    setSending(true);
    setError(null);
    try {
      // The web page always sends plan "Enterprise".
      await api.post('/api/contact', { ...trimmed, plan: 'Enterprise' });
      setSent(true);
    } catch (err) {
      setError(errorMessage(err));
    } finally {
      setSending(false);
    }
  };

  if (sent) {
    return (
      <Screen muted>
        <PageHeader title="Contact" />
        <Card>
          <Text style={[styles.sentTitle, { color: colors.success }]}>✓ Message sent!</Text>
          <Text style={[styles.body, { color: colors.textMuted }]}>
            Thanks for reaching out. Our team will get back to you soon at {email}.
          </Text>
          <Button title="Done" onPress={() => router.back()} style={styles.action} />
        </Card>
      </Screen>
    );
  }

  return (
    <Screen muted form>
      <PageHeader title="Contact" />
      <Text style={[styles.headline, { color: colors.text }]}>Talk to our team</Text>
      <Text style={[styles.body, { color: colors.textMuted }]}>
        Interested in UHRATE Enterprise? Tell us about your needs and we'll get back to you shortly.
      </Text>

      <Card style={styles.form}>
        {error && <ErrorMessage message={error} />}
        <TextField
          label="Your name *"
          value={name}
          onChangeText={(v) => {
            setName(v);
            setErrors((e) => ({ ...e, name: undefined }));
          }}
          error={errors.name}
          placeholder="Full name"
          autoCapitalize="words"
          autoComplete="name"
          returnKeyType="next"
          submitBehavior="submit"
          onSubmitEditing={() => emailInput.current?.focus()}
          editable={!sending}
        />
        <TextField
          ref={emailInput}
          label="Email *"
          value={email}
          onChangeText={(v) => {
            setEmail(v);
            setErrors((e) => ({ ...e, email: undefined }));
          }}
          error={errors.email}
          placeholder="you@company.com"
          autoCapitalize="none"
          autoCorrect={false}
          keyboardType="email-address"
          autoComplete="email"
          returnKeyType="next"
          submitBehavior="submit"
          onSubmitEditing={() => companyInput.current?.focus()}
          editable={!sending}
        />
        <TextField
          ref={companyInput}
          label="Company"
          value={company}
          onChangeText={setCompany}
          placeholder="Company name"
          autoCapitalize="words"
          returnKeyType="next"
          submitBehavior="submit"
          onSubmitEditing={() => messageInput.current?.focus()}
          editable={!sending}
        />
        <TextField
          ref={messageInput}
          label="Message *"
          value={message}
          onChangeText={(v) => {
            setMessage(v);
            setErrors((e) => ({ ...e, message: undefined }));
          }}
          error={errors.message}
          placeholder="Tell us about your use case, expected volume, integration needs, etc."
          multiline
          submitBehavior="newline"
          style={styles.message}
          editable={!sending}
        />
        <Button title="Send message" onPress={handleSend} loading={sending} style={styles.action} />
      </Card>
    </Screen>
  );
}

const styles = StyleSheet.create({
  headline: { fontSize: 22, fontWeight: '700' },
  body: { fontSize: 14, lineHeight: 20, marginTop: 6 },
  form: { marginTop: 16, padding: 20 },
  message: { minHeight: 120, textAlignVertical: 'top' },
  action: { marginTop: 20 },
  sentTitle: { fontSize: 18, fontWeight: '700' },
});
