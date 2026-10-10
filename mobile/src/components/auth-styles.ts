import { StyleSheet } from 'react-native';

// Layout shared by the Login and Register screens. Colors come from useColors().
export const authStyles = StyleSheet.create({
  container: { justifyContent: 'center' },
  title: { fontSize: 26, fontWeight: '700', marginBottom: 4 },
  subtitle: { fontSize: 14, marginBottom: 24 },
  submit: { marginTop: 24 },
  link: { fontWeight: '600', fontSize: 13, textAlign: 'center', marginTop: 20 },
});
