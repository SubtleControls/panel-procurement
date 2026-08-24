import Link from 'next/link';
import { createClient } from '@/lib/supabase/server';
import type { Project } from '@/lib/types';

export const dynamic = 'force-dynamic';

export default async function ProjectsPage() {
  const supabase = createClient();

  const { data, error } = await supabase
    .from('projects_v2')
    .select('project_no, project_name, customer_name, current_stage, target_delivery, panels')
    .neq('current_stage', 'closed')
    .order('project_no');

  if (error) {
    return <p className="text-red-600">Could not load projects: {error.message}</p>;
  }

  const projects = (data ?? []) as Project[];

  return (
    <div>
      <h1 className="text-xl font-semibold">Open projects</h1>
      <p className="mt-1 text-sm text-slate-500">
        {projects.length} projects. Closed projects are hidden.
      </p>

      <div className="card mt-4 overflow-hidden">
        <table className="w-full">
          <thead>
            <tr>
              <th className="th">Project</th>
              <th className="th">Name</th>
              <th className="th">Customer</th>
              <th className="th">Stage</th>
              <th className="th">Panels</th>
              <th className="th">Target</th>
            </tr>
          </thead>
          <tbody>
            {projects.map((p) => (
              <tr key={p.project_no} className="hover:bg-slate-50">
                <td className="td font-medium">
                  <Link
                    className="text-brand hover:underline"
                    href={`/projects/${p.project_no.split('/').map(encodeURIComponent).join('/')}`}
                  >
                    {p.project_no}
                  </Link>
                </td>
                <td className="td">{p.project_name}</td>
                <td className="td text-slate-600">{p.customer_name}</td>
                <td className="td capitalize">{p.current_stage}</td>
                <td className="td">{p.panels?.length ?? 0}</td>
                <td className="td text-slate-600">{p.target_delivery ?? '—'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
