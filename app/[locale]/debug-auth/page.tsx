import { createClient } from '../../../lib/supabase/server';

/**
 * PÁGINA DE DIAGNÓSTICO — accesible sin admin layout
 * Visitar: /en/debug-auth
 * ELIMINAR después de resolver el problema.
 */
export default async function DebugAuthPage() {
  const supabase = await createClient();

  const { data: { user }, error: userError } = await supabase.auth.getUser();
  const { data: { session }, error: sessionError } = await supabase.auth.getSession();

  let roleRow = null;
  let roleError: { message: string; code?: string } | null = null;
  if (user) {
    const result = await supabase
      .from('user_roles')
      .select('role')
      .eq('user_id', user.id)
      .single();
    roleRow = result.data;
    if (result.error) {
      roleError = { message: result.error.message, code: result.error.code };
    }
  }

  return (
    <div style={{ padding: 32, fontFamily: 'monospace', backgroundColor: '#f4f7f6', minHeight: '100vh' }}>
      <h1 style={{ fontSize: 24, marginBottom: 8, color: '#19322F' }}>🔍 Auth Diagnostic</h1>
      <p style={{ color: '#888', marginBottom: 32, fontSize: 13 }}>Ruta: /[locale]/debug-auth — eliminar después</p>

      <section style={{ marginBottom: 24 }}>
        <h2 style={{ color: '#006655', marginBottom: 8 }}>1. getUser() — JWT validation</h2>
        <pre style={{ background: '#fff', padding: 16, borderRadius: 8, border: '1px solid #ddd', overflow: 'auto', fontSize: 13 }}>
          {JSON.stringify({
            user: user ? { id: user.id, email: user.email } : null,
            error: userError?.message ?? null,
          }, null, 2)}
        </pre>
      </section>

      <section style={{ marginBottom: 24 }}>
        <h2 style={{ color: '#006655', marginBottom: 8 }}>2. getSession() — cookie read</h2>
        <pre style={{ background: '#fff', padding: 16, borderRadius: 8, border: '1px solid #ddd', overflow: 'auto', fontSize: 13 }}>
          {JSON.stringify({
            session: session ? { user_id: session.user.id, email: session.user.email } : null,
            error: sessionError?.message ?? null,
          }, null, 2)}
        </pre>
      </section>

      <section style={{ marginBottom: 24 }}>
        <h2 style={{ color: '#006655', marginBottom: 8 }}>3. user_roles DB query</h2>
        <pre style={{ background: '#fff', padding: 16, borderRadius: 8, border: '1px solid #ddd', overflow: 'auto', fontSize: 13 }}>
          {JSON.stringify({ roleRow, error: roleError }, null, 2)}
        </pre>
      </section>
    </div>
  );
}
