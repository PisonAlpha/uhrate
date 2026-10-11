import { RegistryPage } from '@/components/registry-page';
import { legalRegistry } from '@/registries/legal';

// Legal registry (roadmap D26), opened from the Registry tab.
export default function Legal() {
  return <RegistryPage config={legalRegistry} />;
}
