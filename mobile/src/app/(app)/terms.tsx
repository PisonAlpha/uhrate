import { PolicyPage } from '@/components/policy-page';
import { termsPolicy } from '@/content/terms';

// Terms of Service (roadmap D36, E41), opened from About and legal.
export default function Terms() {
  return <PolicyPage policy={termsPolicy} />;
}
