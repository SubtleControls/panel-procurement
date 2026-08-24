import Link from 'next/link';
import { createClient } from '@/lib/supabase/server';

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  let profile: { name: string | null; role: string | null } | null = null;

  if (user) {
    const { data } = await supabase
      .from('app_users')
      .select('name, role')
      .eq('auth_user_id', user.id)
      .maybeSingle();
    profile = data as typeof profile;
  }

  return (
    <div className="min-h-screen">
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-7xl items-center gap-6 px-6 py-3">
          <Link href="/projects" className="font-semibold text-brand">
            Panel Procurement
          </Link>

          <nav className="flex gap-4 text-sm">
            <Link href="/projects" className="text-slate-600 hover:text-brand">
              Projects
            </Link>
            <Link href="/shortages" className="text-slate-600 hover:text-brand">
              Shortages
            </Link>
          </nav>

          <div className="ml-auto flex items-center gap-3 text-sm">
            <span className="text-slate-500">
              {profile?.name ?? user?.email}
              {profile?.role ? (
                <span className="ml-2 rounded bg-slate-100 px-2 py-0.5 text-xs uppercase tracking-wide">
                  {profile.role}
                </span>
              ) : null}
            </span>
            <form action="/auth/signout" method="post">
              <button className="btn-ghost">Sign out</button>
            </form>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-7xl p-6">{children}</main>
    </div>
  );
}
