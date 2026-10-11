import { useState } from 'react';
import { ComingSoon } from '@/components/coming-soon';
import { FilePicker } from '@/components/file-picker';
import type { PickedFile } from '@/lib/file-picker';

// Verifying arrives with roadmap D20. File picking (C13) already works, so
// it is shown here to be tried out.
export default function Verify() {
  const [file, setFile] = useState<PickedFile | null>(null);

  return (
    <ComingSoon
      title="Verify"
      description="Check any image, video or document for AI generation, deepfakes and manipulation, and get a Digital DNA certificate."
    >
      <FilePicker file={file} onChange={setFile} />
    </ComingSoon>
  );
}
