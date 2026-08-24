import { createClient } from '@/lib/supabase/server';
import type { Shortage } from '@/lib/types';

export const dynamic = 'force-dynamic';

export default async function ShortagesPage() {
  const supabase = createClient();

  const { data, error } = await supabase
    .from('v_shortage')
    .select('*')
    .order('balance', { ascending: false });

  if (error) {
    return <p className="text-red-600">Could not load shortages: {error.message}</p>;
  }

  const rows = (data ?? []) as Shortage[];
  const short = rows.filter((r) => r.position === 'SHORT');
  const synced = rows[0]?.stock_synced_at;

  return (
    <div>
      <h1 className="text-xl font-semibold">Shortages</h1>
      <p className="mt-1 text-sm text-slate-500">
        Demand across all draft and issued BOMs versus stock. {short.length} of {rows.length}{' '}
        items are short.
        {synced && <span className="ml-1">Stock as of {new Date(synced).toLocaleString()}.</span>}
      </p>

      <div className="card mt-4 overflow-hidden">
        <table className="w-full">
          <thead>
            <tr>
              <th className="th">Item code</th>
              <th className="th">Description</th>
              <th className="th">Make</th>
              <th className="th">Demand</th>
              <th className="th">Stock</th>
              <th className="th">Balance</th>
              <th className="th">Projects</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r) => (
              <tr key={r.sku} className="hover:bg-slate-50">
                <td className="td font-mono text-xs">{r.sku}</td>
                <td className="td">{r.item_name}</td>
                <td className="td text-slate-600">{r.make}</td>
                <td className="td">{Number(r.total_demand)}</td>
                <td className="td">{Number(r.stock_on_hand)}</td>
                <td
                  className={`td font-semibold ${
                    r.position === 'SHORT' ? 'text-red-600' : 'text-emerald-600'
                  }`}
                >
                  {r.position === 'SHORT' ? Number(r.balance) : 'OK'}
                </td>
                <td className="td text-xs text-slate-500">{r.projects}</td>
              </tr>
            ))}
            {rows.length === 0 && (
              <tr>
                <td className="td text-slate-500" colSpan={7}>
                  No BOM lines yet.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
