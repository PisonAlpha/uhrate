import { PolicyPage } from '@/components/policy-page';
import { privacyPolicy } from '@/content/privacy';

// Privacy Policy (roadmap D36, E41), opened from About and legal, and from
// Register and Login, so it sits outside the signed-in area.
export default function Privacy() {
  return <PolicyPage policy={privacyPolicy} />;
}
