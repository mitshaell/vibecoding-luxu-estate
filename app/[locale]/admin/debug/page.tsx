import { createClient } from '../../../../lib/supabase/server';

/**
 * PÁGINA DE DIAGNÓSTICO TEMPORAL
 * Visitar: /en/admin/debug
 * Muestra la sesión y rol del usuario actual.
 * ELIMINAR en producción.
 */
export default async function AdminDebugPage() {
  const supabase = await createClient();

  const { data: { user }, error: userError } = await supabase.auth.getUser();
  const { data: { session }, error: sessionError } = await supabase.auth.getSession();

  let roleRow = null;
  let roleError = null;
  if (user) {
    const result = await supabase
      .from('user_roles')
      .select('role')
      .eq('user_id', user.id)
      .single();
    roleRow = result.data;
    roleError = result.error;
  }

  return (
    <div style={{ padding: 32, fontFamily: 'monospace', backgroundColor: '#f9f9f9', minHeight: '100vh' }}>
      <h1 style={{ fontSize: 24, marginBottom: 24, color: '#19322F' }}>🔍 Admin Auth Debug</h1>

      <section style={{ marginBottom: 24 }}>
        <h2 style={{ color: '#006655' }}>getUser()</h2>
        <pre style={{ background: '#fff', padding: 16, borderRadius: 8, border: '1px solid #ddd', overflow: 'auto' }}>
          {JSON.stringify({ user: user ? { id: user.id, email: user.email, metadata: user.user_metadata } : null, error: userError?.message }, null, 2)}
        </pre>
      </section>

      <section style={{ marginBottom: 24 }}>
        <h2 style={{ color: '#006655' }}>getSession()</h2>
        <pre style={{ background: '#fff', padding: 16, borderRadius: 8, border: '1px solid #ddd', overflow: 'auto' }}>
          {JSON.stringify({ session: session ? { user_id: session.user.id, email: session.user.email, expires_at: session.expires_at } : null, error: sessionError?.message }, null, 2)}
        </pre>
      </section>

      <section style={{ marginBottom: 24 }}>
        <h2 style={{ color: '#006655' }}>user_roles query</h2>
        <pre style={{ background: '#fff', padding: 16, borderRadius: 8, border: '1px solid #ddd', overflow: 'auto' }}>
          {JSON.stringify({ roleRow, error: roleError?.message, code: roleError?.code }, null, 2)}
        </pre>
      </section>

      <p style={{ color: '#888', fontSize: 12, marginTop: 32 }}>
        ⚠️ Eliminar esta página antes de producción: /app/[locale]/admin/debug/page.tsx
      </p>
    </div>
  );
}
