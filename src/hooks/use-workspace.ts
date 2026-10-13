import { useEffect, useState } from 'react';
import { emptyWorkspace, type Workspace } from '@/lib/fuji';
import { toast } from 'sonner';
const key = 'fuji-local-workspace-v1';
export function useWorkspace() {
  const [workspace, setWorkspace] = useState<Workspace>(() => {
    try { const saved = localStorage.getItem(key); if (saved) return { ...emptyWorkspace, ...JSON.parse(saved) }; } catch { /* Start fresh if browser storage cannot be read. */ }
    return emptyWorkspace;
  });
  useEffect(() => { try { localStorage.setItem(key, JSON.stringify(workspace)); } catch { toast.error('Browser storage is full or unavailable. Export your workspace to keep a copy.'); } }, [workspace]);
  return [workspace, setWorkspace] as const;
}
