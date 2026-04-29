import { createClient } from '../../../lib/supabase/server';
import Link from 'next/link';

interface StatCardProps {
  label: string;
  value: number | string;
  icon: string;
  color: string;
  href?: string;
}

function StatCard({ label, value, icon, color, href }: StatCardProps) {
  const inner = (
    <div
      className="bg-white rounded-2xl p-6 flex items-center gap-4 transition-all hover:shadow-md"
      style={{ boxShadow: '0 2px 12px rgba(25,50,47,0.06)' }}
    >
      <div
        className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0"
        style={{ backgroundColor: `${color}18` }}
      >
        <span className="material-icons text-xl" style={{ color }}>{icon}</span>
      </div>
      <div>
        <p className="text-3xl font-bold" style={{ color: '#19322F' }}>{value}</p>
        <p className="text-sm mt-0.5" style={{ color: '#5C706D' }}>{label}</p>
      </div>
    </div>
  );
  return href ? <Link href={href}>{inner}</Link> : inner;
}

export default async function AdminDashboard({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const supabase = await createClient();

  const [
    { count: totalProperties },
    { count: featuredProperties },
    { count: totalUsers },
    { count: adminUsers },
  ] = await Promise.all([
    supabase.from('properties').select('*', { count: 'exact', head: true }),
    supabase.from('properties').select('*', { count: 'exact', head: true }).eq('is_featured', true),
    supabase.from('user_roles').select('*', { count: 'exact', head: true }),
    supabase.from('user_roles').select('*', { count: 'exact', head: true }).eq('role', 'admin'),
  ]);

  return (
    <div className="p-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold" style={{ color: '#19322F' }}>Dashboard</h1>
        <p className="text-sm mt-1" style={{ color: '#5C706D' }}>Resumen general de LuxeEstate</p>
      </div>

      {/* Stats grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 mb-10">
        <StatCard
          label="Total Propiedades"
          value={totalProperties ?? 0}
          icon="apartment"
          color="#006655"
          href={`/${locale}/admin/properties`}
        />
        <StatCard
          label="Destacadas"
          value={featuredProperties ?? 0}
          icon="star"
          color="#F59E0B"
          href={`/${locale}/admin/properties`}
        />
        <StatCard
          label="Usuarios Registrados"
          value={totalUsers ?? 0}
          icon="group"
          color="#3B82F6"
          href={`/${locale}/admin/users`}
        />
        <StatCard
          label="Administradores"
          value={adminUsers ?? 0}
          icon="shield"
          color="#8B5CF6"
          href={`/${locale}/admin/users`}
        />
      </div>

      {/* Quick links */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Link href={`/${locale}/admin/properties`}>
          <div
            className="bg-white rounded-2xl p-6 border-l-4 hover:shadow-md transition-all cursor-pointer"
            style={{ borderColor: '#006655', boxShadow: '0 2px 12px rgba(25,50,47,0.06)' }}
          >
            <div className="flex items-center gap-3 mb-2">
              <span className="material-icons" style={{ color: '#006655' }}>apartment</span>
              <h2 className="font-semibold" style={{ color: '#19322F' }}>Gestionar Propiedades</h2>
            </div>
            <p className="text-sm" style={{ color: '#5C706D' }}>
              Ver, filtrar y revisar todas las propiedades en la base de datos.
            </p>
          </div>
        </Link>
        <Link href={`/${locale}/admin/users`}>
          <div
            className="bg-white rounded-2xl p-6 border-l-4 hover:shadow-md transition-all cursor-pointer"
            style={{ borderColor: '#3B82F6', boxShadow: '0 2px 12px rgba(25,50,47,0.06)' }}
          >
            <div className="flex items-center gap-3 mb-2">
              <span className="material-icons" style={{ color: '#3B82F6' }}>manage_accounts</span>
              <h2 className="font-semibold" style={{ color: '#19322F' }}>Gestionar Usuarios & Roles</h2>
            </div>
            <p className="text-sm" style={{ color: '#5C706D' }}>
              Editar los roles de los usuarios autenticados en la aplicación.
            </p>
          </div>
        </Link>
      </div>
    </div>
  );
}
