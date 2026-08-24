'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';

export function CreateBomButton({
  projectNo,
  panelName,
  panelQty,
}: {
  projectNo: string;
  panelName: string;
  panelQty: number;
}) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function create() {
    setBusy(true);
    setError(null);

    const supabase = createClient();
    const { data, error } = await supabase
      .from('boms')
      .insert({
        project_no: projectNo,
        panel_name: panelName,
        panel_qty: panelQty,
        status: 'draft',
      })
      .select('id')
      .single();

    if (error) {
      setError(error.message);
      setBusy(false);
      return;
    }

    router.push(`/boms/${data.id}`);
  }

  return (
    <div>
      <button className="btn-ghost" onClick={create} disabled={busy}>
        + {panelName}
        <span className="ml-2 text-xs text-slate-400">x{panelQty}</span>
      </button>
      {error && <p className="mt-1 text-xs text-red-600">{error}</p>}
    </div>
  );
}
