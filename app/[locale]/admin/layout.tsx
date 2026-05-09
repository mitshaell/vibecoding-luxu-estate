import Link from 'next/link';
import { createClient } from '../../../lib/supabase/server';
import { redirect } from 'next/navigation';
import AdminSidebarNav from './components/AdminSidebarNav';
import AdminUserProfile from './components/AdminUserProfile';

interface AdminLayoutProps {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}

export default async function AdminLayout({ children, params }: AdminLayoutProps) {
  const { locale } = await params;
  const supabase = await createClient();

  // ── 1. Verify the user is authenticated ───────────────────────────────────
  // IMPORTANT: use getUser() not getSession().
  // getSession() reads from the cookie without re-validating with the server.
  // getUser() sends the JWT to Supabase and confirms it is still valid.
  const { data: { user }, error: userError } = await supabase.auth.getUser();

  if (!user || userError) {
    redirect(`/${locale}/login`);
  }

  // ── 2. Check role from user_roles ──────────────────────────────────────────
  const { data: roleRow } = await supabase
    .from('user_roles')
    .select('role')
    .eq('user_id', user.id)
    .single();

  const role = roleRow?.role ?? 'user';

  if (role !== 'admin') {
    redirect(`/${locale}`);
  }

  // ── 3. Render admin panel ──────────────────────────────────────────────────
  const avatarUrl = user.user_metadata?.avatar_url || user.user_metadata?.picture;
  const displayName = user.user_metadata?.full_name || user.email;

  const navItems = [
    { href: `/${locale}/admin`, label: 'Dashboard', icon: 'dashboard', exact: true },
    { href: `/${locale}/admin/properties`, label: 'Propiedades', icon: 'apartment' },
    { href: `/${locale}/admin/users`, label: 'Usuarios & Roles', icon: 'manage_accounts' },
  ];

  return (
    <div className="min-h-screen flex" style={{ backgroundColor: '#F4F7F6' }}>
      {/* ── Sidebar ────────────────────────────────────────────────────────── */}
      <aside
        className="w-64 flex-shrink-0 flex flex-col"
        style={{
          backgroundColor: '#19322F',
          boxShadow: '4px 0 24px rgba(0,0,0,0.15)',
        }}
      >
        {/* Logo */}
        <div className="flex items-center gap-3 px-6 py-6 border-b border-white/10">
          <div className="w-8 h-8 rounded-lg bg-[#006655] flex items-center justify-center">
            <span className="material-icons text-white text-lg">apartment</span>
          </div>
          <div>
            <p className="text-white font-semibold text-sm leading-tight">LuxeEstate</p>
            <p className="text-white/40 text-xs">Admin Panel</p>
          </div>
        </div>

        {/* Nav */}
        <AdminSidebarNav navItems={navItems} />

        {/* User info at bottom */}
        <AdminUserProfile 
          avatarUrl={avatarUrl}
          displayName={displayName}
          locale={locale}
        />
      </aside>

      {/* ── Main content ───────────────────────────────────────────────────── */}
      <main className="flex-1 overflow-auto">
        {children}
      </main>
    </div>
  );
}
