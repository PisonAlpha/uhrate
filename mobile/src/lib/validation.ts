// Basic shape check (something@something.tld, no spaces). The server still
// decides whether the address is acceptable.
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function isValidEmail(email: string): boolean {
  return EMAIL_PATTERN.test(email);
}
