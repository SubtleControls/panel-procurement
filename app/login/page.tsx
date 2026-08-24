'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError(null);

    const supabase = createClient();
    const { error } = await supabase.auth.signInWithPassword({ email, password });

    if (error) {
      setError(error.message);
      setBusy(false);
      return;
    }

    router.push('/projects');
    router.refresh();
  }

  return (
    <main className="flex min-h-screen items-center justify-center p-6">
      <div className="card w-full max-w-sm p-6">
        <h1 className="text-lg font-semibold text-brand">Panel Procurement</h1>
        <p className="mt-1 text-sm text-slate-500">Subtle Controls</p>

        <form onSubmit={onSubmit} className="mt-6 space-y-4">
          <div>
            <label className="mb-1 block text-sm font-medium">Email</label>
            <input
              type="email"
              className="input"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium">Password</label>
            <input
              type="password"
              className="input"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          {error && (
            <p className="rounded-md bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p>
          )}

          <button className="btn w-full" disabled={busy}>
            {busy ? 'Signing in…' : 'Sign in'}
          </button>
        </form>

        <p className="mt-4 text-xs text-slate-500">Use your existing Subtle OS credentials.</p>
      </div>
    </main>
  );
}
