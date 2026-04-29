import { createClient } from '../../../../lib/supabase/server';
import RoleEditor from './RoleEditor';

export default async function AdminUsersPage() {
  const supabase = await createClient();
  const { data: { session } } = await supabase.auth.getSession();
  const currentUserId = session?.user?.id;

  // Fetch all users with their roles using the admin view
  const { data: userRoles } = await supabase
    .from('user_roles')
    .select('user_id, role, created_at')
    .order('created_at', { ascending: false });

  // Fetch auth users metadata — available through Supabase admin or user_metadata trick
  // We'll use the email from user_metadata stored in the JWT if available,
  // otherwise we show the user_id
  const rows = userRoles ?? [];

  return (
    <div className="p-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold" style={{ color: '#19322F' }}>Usuarios & Roles</h1>
        <p className="text-sm mt-1" style={{ color: '#5C706D' }}>
          {rows.length} usuarios registrados — edita el rol de cada uno.
        </p>
      </div>

      {/* Info banner */}
      <div
        className="mb-6 flex items-start gap-3 rounded-xl p-4"
        style={{ backgroundColor: '#FEF3C7', border: '1px solid #FDE68A' }}
      >
        <span className="material-icons text-base mt-0.5" style={{ color: '#92400E' }}>info</span>
        <p className="text-sm" style={{ color: '#92400E' }}>
          No puedes cambiar tu propio rol. Los cambios se guardan automáticamente.
          El nuevo rol se aplicará en el próximo inicio de sesión del usuario.
        </p>
      </div>

      {/* Table */}
      <div
        className="bg-white rounded-2xl overflow-hidden"
        style={{ boxShadow: '0 2px 12px rgba(25,50,47,0.06)' }}
      >
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr style={{ backgroundColor: '#F4F7F6', borderBottom: '1px solid #E2EBEA' }}>
                {['Usuario', 'ID', 'Rol actual', 'Registrado', 'Cambiar rol'].map(h => (
                  <th
                    key={h}
                    className="text-left px-5 py-3.5 font-semibold text-xs uppercase tracking-wide"
                    style={{ color: '#5C706D' }}
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {rows.map((row, idx) => {
                const isSelf = row.user_id === currentUserId;
                const shortId = row.user_id.split('-')[0];
                const createdDate = new Date(row.created_at).toLocaleDateString('es-ES', {
                  day: '2-digit', month: 'short', year: 'numeric'
                });

                return (
                  <tr
                    key={row.user_id}
                    style={{
                      borderBottom: idx < rows.length - 1 ? '1px solid #F0F5F4' : undefined,
                      backgroundColor: isSelf ? '#F9FCFB' : undefined,
                    }}
                  >
                    {/* Avatar placeholder */}
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-3">
                        <div
                          className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold text-white flex-shrink-0"
                          style={{ backgroundColor: row.role === 'admin' ? '#8B5CF6' : '#006655' }}
                        >
                          {shortId.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <p className="font-medium" style={{ color: '#19322F' }}>
                            {isSelf ? 'Tú' : `Usuario ${shortId}`}
                          </p>
                          {isSelf && (
                            <p className="text-xs" style={{ color: '#5C706D' }}>Tu cuenta</p>
                          )}
                        </div>
                      </div>
                    </td>

                    {/* ID */}
                    <td className="px-5 py-4">
                      <code
                        className="text-xs px-2 py-1 rounded-md"
                        style={{ backgroundColor: '#F0F5F4', color: '#5C706D' }}
                      >
                        {row.user_id.slice(0, 8)}…
                      </code>
                    </td>

                    {/* Current role badge */}
                    <td className="px-5 py-4">
                      <span
                        className="px-2.5 py-1 rounded-full text-xs font-semibold"
                        style={{
                          backgroundColor: row.role === 'admin' ? '#F5F3FF' : '#EEF6F6',
                          color: row.role === 'admin' ? '#8B5CF6' : '#006655',
                        }}
                      >
                        {row.role}
                      </span>
                    </td>

                    {/* Date */}
                    <td className="px-5 py-4 text-xs" style={{ color: '#5C706D' }}>
                      {createdDate}
                    </td>

                    {/* Role editor */}
                    <td className="px-5 py-4">
                      <RoleEditor
                        userId={row.user_id}
                        currentRole={row.role}
                        isSelf={isSelf}
                      />
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {rows.length === 0 && (
          <div className="py-16 text-center" style={{ color: '#5C706D' }}>
            <span className="material-icons text-4xl mb-2 block" style={{ color: '#D1D5DB' }}>group</span>
            No hay usuarios registrados aún.
          </div>
        )}
      </div>
    </div>
  );
}
