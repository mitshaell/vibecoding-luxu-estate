import { createClient } from '../../../../lib/supabase/server';
import Link from 'next/link';

export default async function AdminPropertiesPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const supabase = await createClient();

  const { data: properties } = await supabase
    .from('properties')
    .select('id, title, location, type, price, price_detail, beds, baths, is_featured, is_rent, slug, created_at')
    .order('created_at', { ascending: false });

  const rows = properties ?? [];

  return (
    <div className="p-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold" style={{ color: '#19322F' }}>Propiedades</h1>
          <p className="text-sm mt-1" style={{ color: '#5C706D' }}>{rows.length} propiedades en total</p>
        </div>
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
                {['Título', 'Ubicación', 'Tipo', 'Precio', 'Hab / Baños', 'Modo', 'Destacada', 'Acciones'].map(h => (
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
              {rows.map((p, idx) => (
                <tr
                  key={p.id}
                  style={{
                    borderBottom: idx < rows.length - 1 ? '1px solid #F0F5F4' : undefined,
                  }}
                  className="hover:bg-[#F9FCFB] transition-colors"
                >
                  <td className="px-5 py-4">
                    <span className="font-medium" style={{ color: '#19322F' }}>{p.title}</span>
                  </td>
                  <td className="px-5 py-4" style={{ color: '#5C706D' }}>{p.location}</td>
                  <td className="px-5 py-4">
                    <span
                      className="px-2.5 py-1 rounded-full text-xs font-medium"
                      style={{ backgroundColor: '#EEF6F6', color: '#006655' }}
                    >
                      {p.type}
                    </span>
                  </td>
                  <td className="px-5 py-4 font-semibold" style={{ color: '#19322F' }}>
                    {p.price}
                    {p.price_detail && <span className="text-xs font-normal ml-1" style={{ color: '#5C706D' }}>{p.price_detail}</span>}
                  </td>
                  <td className="px-5 py-4" style={{ color: '#5C706D' }}>
                    {p.beds} hab · {p.baths} baños
                  </td>
                  <td className="px-5 py-4">
                    <span
                      className="px-2.5 py-1 rounded-full text-xs font-medium"
                      style={{
                        backgroundColor: p.is_rent ? '#FEF3C7' : '#DCFCE7',
                        color: p.is_rent ? '#92400E' : '#166534',
                      }}
                    >
                      {p.is_rent ? 'Alquiler' : 'Venta'}
                    </span>
                  </td>
                  <td className="px-5 py-4">
                    {p.is_featured ? (
                      <span className="material-icons text-base" style={{ color: '#F59E0B' }}>star</span>
                    ) : (
                      <span className="material-icons text-base" style={{ color: '#D1D5DB' }}>star_border</span>
                    )}
                  </td>
                  <td className="px-5 py-4">
                    {p.slug && (
                      <Link
                        href={`/${locale}/property/${p.slug}`}
                        target="_blank"
                        className="flex items-center gap-1 text-xs font-medium transition-colors"
                        style={{ color: '#006655' }}
                      >
                        <span className="material-icons text-sm">open_in_new</span>
                        Ver
                      </Link>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
