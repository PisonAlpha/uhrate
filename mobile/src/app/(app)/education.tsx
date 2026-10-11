import { RegistryPage } from '@/components/registry-page';
import { educationRegistry } from '@/registries/education';

// Education registry (roadmap D25), opened from the Registry tab.
export default function Education() {
  return <RegistryPage config={educationRegistry} />;
}
