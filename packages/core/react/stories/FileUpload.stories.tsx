import { useEffect, useRef, useState } from 'react';
import { FileUpload, type UploadItem } from '../compounds/FileUpload';
import type { StoryFile } from './story';

const LIMIT = 10_000_000;

/** Pretend uploads: each file sends in steps; anything over 10 MB fails with the reason, and Retry sends it again. */
function useUploads(initial: UploadItem[] = []) {
  const [files, setFiles] = useState<UploadItem[]>(initial);
  const timers = useRef(new Map<string, number>());

  const send = (id: string, bytes: number) => {
    window.clearInterval(timers.current.get(id));
    const t = window.setInterval(() => {
      setFiles((all) =>
        all.map((f) => {
          if (f.id !== id) return f;
          const next = (f.progress ?? 0) + 12;
          if (bytes > LIMIT && next > 30) {
            window.clearInterval(t);
            return { ...f, status: 'failed', progress: undefined, error: 'The file is larger than 10 MB. Choose a smaller one, or compress it.' };
          }
          if (next >= 100) {
            window.clearInterval(t);
            return { ...f, status: 'done', progress: undefined };
          }
          return { ...f, status: 'uploading', progress: next, error: undefined };
        }),
      );
    }, 400);
    timers.current.set(id, t);
  };

  // Files already on their way when it opens carry on; every pretend upload stops when it closes.
  useEffect(() => {
    initial.filter((f) => f.status === 'uploading').forEach((f) => send(f.id, f.size));
    const all = timers.current;
    return () => all.forEach((t) => window.clearInterval(t));
  }, []);

  return {
    files,
    onAdd: (chosen: File[]) => {
      const items = chosen.map((file, i) => ({ id: `${Date.now()}-${i}-${file.name}`, name: file.name, size: file.size, status: 'uploading' as const, progress: 0 }));
      setFiles((all) => [...all, ...items]);
      items.forEach((it) => send(it.id, it.size));
    },
    onRemove: (id: string) => {
      window.clearInterval(timers.current.get(id));
      setFiles((all) => all.filter((f) => f.id !== id));
    },
    onRetry: (id: string) => {
      setFiles((all) => all.map((f) => (f.id === id ? { ...f, status: 'uploading', progress: 0, error: undefined } : f)));
      const f = files.find((x) => x.id === id);
      // A retried file sends in full here, as if it had been made smaller.
      if (f) send(id, Math.min(f.size, LIMIT));
    },
  };
}

function Receipts() {
  const uploads = useUploads([
    { id: 'a', name: 'taxi-berlin-0311.pdf', size: 184_000, status: 'done' },
    { id: 'b', name: 'hotel-folio-march.pdf', size: 2_400_000, status: 'uploading', progress: 45 },
    { id: 'c', name: 'conference-dinner-photos.zip', size: 48_000_000, status: 'failed', error: 'The file is larger than 10 MB. Choose a smaller one, or compress it.' },
  ]);
  return <FileUpload label="Receipts" hint="PDF or JPG, up to 10 MB each" accept=".pdf,.jpg,.jpeg" multiple {...uploads} />;
}

function Single() {
  const uploads = useUploads();
  // One file is kept: choosing again replaces it.
  const onAdd = (chosen: File[]) => {
    uploads.files.forEach((f) => uploads.onRemove(f.id));
    uploads.onAdd(chosen);
  };
  return <FileUpload label="Signed contract" hint="A PDF of the signed pages" accept=".pdf" dropzone={false} {...uploads} onAdd={onAdd} />;
}

export default {
  component: 'FileUpload',
  tier: 'compound',
  summary: 'Choosing files to send: a button, a drop area that also takes dragged files, and each file’s own progress, outcome, Retry and Remove.',
  stories: [
    {
      title: 'Several files, with a drop area',
      description:
        'Choose files or drag them onto the sunken area: it takes an outline only while files are over it. Each file shows its size and its own progress, then Uploaded, or what went wrong with Retry. Files over 10 MB fail here; Retry sends them as if made smaller. Removing one moves focus to the next.',
      code: `<FileUpload label="Receipts" hint="PDF or JPG, up to 10 MB each" accept=".pdf,.jpg,.jpeg" multiple files={files} onAdd={upload} onRemove={remove} onRetry={retry} />`,
      render: () => <Receipts />,
    },
    {
      title: 'One file, button only',
      description: 'Where dragging isn’t expected (a phone, a short form) the button stands alone. Without multiple it takes one file; here choosing again replaces it.',
      code: `<FileUpload label="Signed contract" hint="A PDF of the signed pages" accept=".pdf" dropzone={false} files={files} onAdd={upload} onRemove={remove} />`,
      render: () => <Single />,
    },
  ],
} satisfies StoryFile;
