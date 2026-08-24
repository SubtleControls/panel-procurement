import Link from 'next/link';
import { createClient } from '@/lib/supabase/server';
import type { Project, Bom } from '@/lib/types';
import { CreateBomButton } from './create-bom';

export const dynamic = 'force-dynamic';

export default async function ProjectPage({ params }: { params: { projectNo: string[] } }) {
  const projectNo = params.projectNo.map(decodeURIComponent).join('/');
  const supabase = createClient();

  const { data: project } = await supabase
    .from('projects_v2')
    .select('project_no, project_name, customer_name, current_stage, target_delivery, panels')
    .eq('project_no', projectNo)
    .maybeSingle<Project>();

  const { data: bomsData } = await supabase
    .from('boms')
    .select('id, project_no, panel_name, panel_qty, status, notes')
    .eq('project_no', projectNo)
    .order('panel_name');

  const boms = (bomsData ?? []) as Bom[];

  if (!project) {
    return <p className="text-red-600">Project {projectNo} not found.</p>;
  }

  const existing = new Set(boms.map((b) => b.panel_name));
  const panelsWithoutBom = (project.panels ?? []).filter((p) => !existing.has(p.name.trim()));

  return (
    <div>
      <Link href="/projects" className="text-sm text-slate-500 hover:text-brand">
        ← Projects
      </Link>

      <h1 className="mt-2 text-xl font-semibold">{project.project_name}</h1>
      <p className="text-sm text-slate-500">
        {project.project_no} · {project.customer_name} · stage {project.current_stage} · target{' '}
        {project.target_delivery ?? '—'}
      </p>

      <h2 className="mt-6 text-sm font-semibold uppercase tracking-wide text-slate-500">
        Bills of material
      </h2>

      <div className="card mt-2 overflow-hidden">
        <table className="w-full">
          <thead>
            <tr>
              <th className="th">Panel</th>
              <th className="th">Panel qty</th>
              <th className="th">Status</th>
              <th className="th"></th>
            </tr>
          </thead>
          <tbody>
            {boms.map((b) => (
              <tr key={b.id} className="hover:bg-slate-50">
                <td className="td font-medium">{b.panel_name}</td>
                <td className="td">{b.panel_qty}</td>
                <td className="td capitalize">{b.status}</td>
                <td className="td text-right">
                  <Link className="text-brand hover:underline" href={`/boms/${b.id}`}>
                    Open
                  </Link>
                </td>
              </tr>
            ))}
            {boms.length === 0 && (
              <tr>
                <td className="td text-slate-500" colSpan={4}>
                  No BOMs yet.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {panelsWithoutBom.length > 0 && (
        <>
          <h2 className="mt-6 text-sm font-semibold uppercase tracking-wide text-slate-500">
            Panels without a BOM
          </h2>
          <div className="mt-2 flex flex-wrap gap-2">
            {panelsWithoutBom.map((p) => (
              <CreateBomButton
                key={p.name}
                projectNo={project.project_no}
                panelName={p.name.trim()}
                panelQty={p.quantity ?? 1}
              />
            ))}
          </div>
          <p className="mt-2 text-xs text-slate-500">
            Panels come from Subtle OS. Quantities are per the project record.
          </p>
        </>
      )}
    </div>
  );
}
