import { RegistryPage } from '@/components/registry-page';
import { mediaRegistry } from '@/registries/media';

// Media registry (roadmap D27), opened from the Registry tab.
export default function Media() {
  return <RegistryPage config={mediaRegistry} />;
}
