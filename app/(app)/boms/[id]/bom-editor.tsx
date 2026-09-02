'use client';

import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import type { BomLine, Item } from '@/lib/types';

export function BomEditor({
  bomId,
  panelQty,
  initialLines,
}: {
  bomId: string;
  panelQty: number;
  initialLines: BomLine[];
}) {
  const router = useRouter();
  const supabase = useMemo(() => createClient(), []);

  const [lines, setLines] = useState<BomLine[]>(initialLines);
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<Item[]>([]);
  const [selected, setSelected] = useState<Item | null>(null);
  const [qty, setQty] = useState('1');
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    setLines(initialLines);
  }, [initialLines]);

  useEffect(() => {
    const term = query.trim();
    if (term.length < 2) {
      setResults([]);
      return;
    }

    let cancelled = false;
    const timer = setTimeout(async () => {
      // Two queries rather than .or(): PostgREST splits an `or` filter string on
      // commas, so a term like "Contactor, 3P" is reparsed as extra conditions.
      const columns = 'sku, name, make, unit';
      const [byCode, byName] = await Promise.all([
        supabase.from('items').select(columns).ilike('sku', `%${term}%`).eq('is_active', true).limit(20),
        supabase.from('items').select(columns).ilike('name', `%${term}%`).eq('is_active', true).limit(20),
      ]);

      const merged = new Map<string, Item>();
      for (const row of [...(byCode.data ?? []), ...(byName.data ?? [])]) {
        merged.set((row as Item).sku, row as Item);
      }

      if (!cancelled) setResults(Array.from(merged.values()).slice(0, 20));
    }, 250);

    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, [query, supabase]);

  async function addLine() {
    if (!selected) return;
    setBusy(true);
    setError(null);

    const { error } = await supabase.from('bom_lines').insert({
      bom_id: bomId,
      sku: selected.sku,
      qty_per_panel: Number(qty),
    });

    setBusy(false);

    if (error) {
      setError(
        error.code === '23505'
          ? `${selected.sku} is already on this BOM — edit the existing line instead.`
          : error.message
      );
      return;
    }

    setSelected(null);
    setQuery('');
    setQty('1');
    router.refresh();
  }

  async function removeLine(lineId: string) {
    setError(null);
    const { error } = await supabase.from('bom_lines').delete().eq('id', lineId);
    if (error) {
      setError(error.message);
      return;
    }
    router.refresh();
  }

  return (
    <div className="mt-6 space-y-6">
      <div className="card p-4">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-500">Add item</h2>

        <div className="mt-3 grid gap-3 md:grid-cols-[1fr_120px_auto]">
          <div className="relative">
            <input
              className="input"
              placeholder="Search by item code or description…"
              value={selected ? `${selected.sku} — ${selected.name}` : query}
              onChange={(e) => {
                setSelected(null);
                setQuery(e.target.value);
              }}
            />

            {!selected && results.length > 0 && (
              <ul className="absolute z-10 mt-1 max-h-72 w-full overflow-auto rounded-md border border-slate-200 bg-white shadow-lg">
                {results.map((it) => (
                  <li key={it.sku}>
                    <button
                      type="button"
                      className="block w-full px-3 py-2 text-left text-sm hover:bg-slate-50"
                      onClick={() => {
                        setSelected(it);
                        setResults([]);
                      }}
                    >
                      <span className="font-mono text-xs text-brand">{it.sku}</span>{' '}
                      <span>{it.name}</span>
                      {it.make && <span className="ml-2 text-xs text-slate-400">{it.make}</span>}
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>

          <input
            className="input"
            type="number"
            min="0.001"
            step="any"
            value={qty}
            onChange={(e) => setQty(e.target.value)}
            placeholder="Qty / panel"
          />

          <button className="btn" onClick={addLine} disabled={!selected || busy}>
            Add
          </button>
        </div>

        {error && (
          <p className="mt-3 rounded-md bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p>
        )}

        <p className="mt-2 text-xs text-slate-500">
          Only catalogue items can be added — unknown codes are rejected by the database.
        </p>
      </div>

      <div className="card overflow-hidden">
        <table className="w-full">
          <thead>
            <tr>
              <th className="th">Item code</th>
              <th className="th">Description</th>
              <th className="th">Make</th>
              <th className="th">Unit</th>
              <th className="th">Qty / panel</th>
              <th className="th">Total ({panelQty} panels)</th>
              <th className="th">Stock</th>
              <th className="th"></th>
            </tr>
          </thead>
          <tbody>
            {lines.map((l) => {
              const short = Number(l.total_required) > Number(l.stock_on_hand);
              return (
                <tr key={l.line_id} className="hover:bg-slate-50">
                  <td className="td font-mono text-xs">{l.sku}</td>
                  <td className="td">{l.item_name}</td>
                  <td className="td text-slate-600">{l.make}</td>
                  <td className="td text-slate-600">{l.unit}</td>
                  <td className="td">{Number(l.qty_per_panel)}</td>
                  <td className="td font-medium">{Number(l.total_required)}</td>
                  <td className={`td ${short ? 'text-red-600' : 'text-slate-600'}`}>
                    {Number(l.stock_on_hand)}
                  </td>
                  <td className="td text-right">
                    <button
                      className="text-xs text-slate-400 hover:text-red-600"
                      onClick={() => removeLine(l.line_id)}
                    >
                      Remove
                    </button>
                  </td>
                </tr>
              );
            })}
            {lines.length === 0 && (
              <tr>
                <td className="td text-slate-500" colSpan={8}>
                  No lines yet. Search for an item above.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
