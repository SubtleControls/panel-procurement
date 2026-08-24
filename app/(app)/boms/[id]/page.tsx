import Link from 'next/link';
import { createClient } from '@/lib/supabase/server';
import type { Bom, BomLine } from '@/lib/types';
import { BomEditor } from './bom-editor';

export const dynamic = 'force-dynamic';

export default async function BomPage({ params }: { params: { id: string } }) {
  const supabase = createClient();

  const { data: bom } = await supabase
    .from('boms')
    .select('id, project_no, panel_name, panel_qty, status, notes')
    .eq('id', params.id)
    .maybeSingle<Bom>();

  if (!bom) {
    return <p className="text-red-600">BOM not found.</p>;
  }

  const { data: linesData } = await supabase
    .from('v_bom_lines')
    .select('line_id, bom_id, sku, item_name, make, unit, qty_per_panel, total_required, stock_on_hand')
    .eq('bom_id', bom.id)
    .order('item_name');

  const lines = (linesData ?? []) as BomLine[];

  return (
    <div>
      <Link
        href={`/projects/${bom.project_no.split('/').map(encodeURIComponent).join('/')}`}
        className="text-sm text-slate-500 hover:text-brand"
      >
        ← {bom.project_no}
      </Link>

      <h1 className="mt-2 text-xl font-semibold">{bom.panel_name}</h1>
      <p className="text-sm text-slate-500">
        Panel quantity {bom.panel_qty} · {lines.length} lines · status {bom.status}
      </p>

      <BomEditor bomId={bom.id} panelQty={bom.panel_qty} initialLines={lines} />
    </div>
  );
}
