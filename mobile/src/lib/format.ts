import type { PillTone } from '@/components/pill';
import type { AuthUser } from '@/types/auth';

// Same grouping as getRatingStyle on the web dashboard.
export function ratingTone(rating: string | null): PillTone {
  switch (rating) {
    case 'Verified Original':
    case 'Likely Original':
      return 'success';
    case 'Mixed Content':
    case 'AI Assisted':
      return 'warning';
    case 'AI Generated':
    case 'Deepfake Suspected':
    case 'High Risk':
      return 'danger';
    default:
      return 'neutral';
  }
}

// Same thresholds as getTrustColor on the web dashboard.
export function trustTone(score: number): PillTone {
  if (score >= 70) return 'success';
  if (score >= 40) return 'warning';
  return 'danger';
}

export function planLabel(role: string | undefined): string {
  switch (role) {
    case 'enterprise':
      return 'Enterprise';
    case 'pro':
      return 'Pro';
    default:
      return 'Free';
  }
}

/** Free (individual) accounts have 10 credits; paid plans are unlimited, as on the web profile. */
export function creditsLabel(user: Pick<AuthUser, 'role' | 'credits'>): string {
  return user.role === 'individual' ? `${user.credits ?? 0} / 10` : 'Unlimited';
}

export function formatDate(iso: string | null | undefined): string {
  return iso ? new Date(iso).toLocaleDateString() : 'N/A';
}

/** 0x1234…abcd */
export function formatAddress(address: string): string {
  return `${address.slice(0, 6)}…${address.slice(-4)}`;
}
