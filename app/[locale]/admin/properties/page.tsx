import { createClient } from '../../../../lib/supabase/server';
import Link from 'next/link';
import { togglePropertyActive } from './actions';

// Status badge — now supports is_active
function StatusBadge({ isActive }: { isActive: boolean }) {
  if (isActive) {
    return (
      <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-hint-green text-primary border border-primary/10">
        <span className="w-1.5 h-1.5 rounded-full bg-primary mr-1.5" />
        Activa
      </span>
    );
  }
  return (
    <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400 border border-gray-200 dark:border-gray-700">
      <span className="w-1.5 h-1.5 rounded-full bg-gray-400 mr-1.5" />
      Inactiva
    </span>
  );
}

// Default placeholder images for properties without an image
const PLACEHOLDER_IMAGES = [
  'https://lh3.googleusercontent.com/aida-public/AB6AXuAk2ZSdNOQ0gAXqtE2fb8NByvZ3XDhK1eHyPrIVVzkKRxP--gmwVUs_dFtYH7ySMZBDJ9dUfLhxw1HqhJRxo0T5qrmKZz1GjWXADnSf4hEPvVDRm0aKTl3gRRF5M9S5wRufLo8fKI5Py_un_8jurvEW2rsKLVZXiOt9hZvHtaEHizJmZZC2ncBfdpPfu9UtyE_aFK_1NSxqRUcAyEWvWqLel7QMCA0_DAS7ch6BAEubDCw3iSjElZ-uF5TUlSkdQudUUhJJJ83mUuI',
  'https://lh3.googleusercontent.com/aida-public/AB6AXuCvjnJzYkn2uSsE2x2CSp6ta_eTDBXO0CZv61SwICEoMCfPe-cXvPfWieOb9hv9CnQctjbT43Fs4LcDrGOwXm4RhUAmZwiePudeFf6wid2-OWTpcQ1jl4SMOfOe_jSsjtjahG_azMWzAEvQ0Lsznu5nzMuAHgSN7A0vJzviwycaZsVzyYS4tVIpC1QprgwkIuolRTTXvY-OhBEuMuxtXQ4MJJH3k3FpWJX07kPgNzSqclGY5HvlrSlEEBoFvh_8Q9-JZTCFF8ipOWU',
  'https://lh3.googleusercontent.com/aida-public/AB6AXuBO_XzpFopH9b8yABT1a6LlIMtEJKX00xuhg2A0IeMjK9sALNffKjbe7t7f8gCqV5ZzBgmyXTq7pB9bqc3UWVnFMPevsVV4XVmVmYGeMx73HL0uaixP254RZfPJ-zWwsJ4WdYzi1mxC0BpDIzW-hZwVm37WY1SePsrzRCGzDdssQ8fuDXGat1chiFJTtJAnWQqGHIaApgBNfDlwItdrqc7Rz4nsaxgLOVGgJbBXzoxtcLKLkVWuf9KfnT_xwMYaD0ps9cLRzZtlRh0',
  'https://lh3.googleusercontent.com/aida-public/AB6AXuAm5jrJp_zdGyEfKQhZOpfX0eYAr_nK7lYpqgTo6B3X0V84hnvkBRKtd1NKfyzbZXptrnatucZKXEUdB_g4pmYytqZB_6-vGvs8VifQGG9fRqVL_Lr6350F_fSVeZh0hqULKewnVdwnGc8thCF8ARhaHzH9EtDknKo21GxwPEYTOXaaHEeGSVTSMSma2diZicSwy3jelgSoYNdpIQoMAgcmM2OlWB--DvX-WR-AYQ6rtTFbnnBwM1_2FW1r4bTYvX1Xw5KFp1GySqI',
  'https://lh3.googleusercontent.com/aida-public/AB6AXuD3Kx0QAdUmL9txkYX2nBiMhiFrJIW59QWMclky71MuBfbl_DzIipQvGFMh8fxLAVvFg8otdIJr9lt4W4RkWo5lQlQFhqc_BCTDITjg-y2PGAZ8mewi_ipn_U_wASsLBvwXfK1akutnYmO_yIN23qhIHGZnkxxh7y7sfwD90EloN5uILLeA5NUVHbczcFicGewNod99A1k_IOfesqSTya9-dj5KifLlwcnuWggNHe4Gn2DREAc_6FcD6N_CpGybDw32EMk0AiRcWGY',
];

// Toggle button — client component wrapper
function ToggleActiveButton({
  id,
  isActive,
  locale,
}: {
  id: string;
  isActive: boolean;
  locale: string;
}) {
  const action = togglePropertyActive.bind(null, id, isActive, locale);
  return (
    <form action={action}>
      <button
        type="submit"
        title={isActive ? 'Desactivar propiedad' : 'Activar propiedad'}
        className={`p-2 rounded-lg transition-all tooltip-trigger ${
          isActive
            ? 'text-gray-400 hover:text-amber-500 hover:bg-amber-50 dark:hover:bg-amber-900/20'
            : 'text-gray-400 hover:text-primary hover:bg-hint-green/30'
        }`}
      >
        <span className="material-icons text-xl">
          {isActive ? 'toggle_on' : 'toggle_off'}
        </span>
      </button>
    </form>
  );
}

export default async function AdminPropertiesPage(props: {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const { locale } = await props.params;
  const searchParams = await props.searchParams;
  const page = parseInt((searchParams.page as string) || '1', 10);
  const limit = 10;
  const from = (page - 1) * limit;
  const to = from + limit - 1;

  const supabase = await createClient();

  // Admin panel shows ALL properties (active + inactive)
  const { data: properties, count } = await supabase
    .from('properties')
    .select(
      'id, title, location, type, price, price_detail, beds, baths, is_featured, is_rent, is_active, slug, created_at, images',
      { count: 'exact' }
    )
    .order('created_at', { ascending: false })
    .range(from, to);

  const rows = properties ?? [];
  const totalCount = count ?? 0;

  // Derived stats
  const activeCount = rows.filter((p) => p.is_active).length;
  const inactiveCount = rows.filter((p) => !p.is_active).length;

  return (
    <div className="min-h-full bg-background-light dark:bg-background-dark font-display">
      <main className="flex-grow max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-10">
        {/* Header Section */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-bold text-nordic dark:text-white tracking-tight">
              Propiedades
            </h1>
            <p className="text-gray-500 dark:text-gray-400 mt-1">
              Administra el portafolio de propiedades.
            </p>
          </div>
          <div className="flex items-center gap-3">
            <Link
              href={`/${locale}/admin/properties/new`}
              className="bg-primary hover:bg-primary/90 text-white px-5 py-2.5 rounded-lg text-sm font-medium shadow-md shadow-primary/20 transition-all transform hover:-translate-y-0.5 inline-flex items-center gap-2"
            >
              <span className="material-icons text-base">add</span> Nueva Propiedad
            </Link>
          </div>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-8">
          <div className="bg-white dark:bg-[#152e2a] p-5 rounded-xl border border-primary/10 shadow-sm flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Total</p>
              <p className="text-2xl font-bold text-nordic dark:text-white mt-1">{totalCount}</p>
            </div>
            <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center text-primary">
              <span className="material-icons">apartment</span>
            </div>
          </div>
          <div className="bg-white dark:bg-[#152e2a] p-5 rounded-xl border border-primary/10 shadow-sm flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Activas</p>
              <p className="text-2xl font-bold text-nordic dark:text-white mt-1">{activeCount}</p>
            </div>
            <div className="h-10 w-10 rounded-full bg-hint-green flex items-center justify-center text-primary">
              <span className="material-icons">check_circle</span>
            </div>
          </div>
          <div className="bg-white dark:bg-[#152e2a] p-5 rounded-xl border border-primary/10 shadow-sm flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Inactivas</p>
              <p className="text-2xl font-bold text-nordic dark:text-white mt-1">{inactiveCount}</p>
            </div>
            <div className="h-10 w-10 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center text-gray-500">
              <span className="material-icons">visibility_off</span>
            </div>
          </div>
        </div>

        {/* Property List Container */}
        <div className="bg-white dark:bg-[#152e2a] rounded-xl shadow-sm border border-gray-200 dark:border-primary/20 overflow-hidden">
          {/* Table Header */}
          <div className="hidden md:grid grid-cols-12 gap-4 px-6 py-4 bg-gray-50/50 dark:bg-primary/5 border-b border-gray-100 dark:border-primary/10 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
            <div className="col-span-6">Detalles de la Propiedad</div>
            <div className="col-span-2">Precio</div>
            <div className="col-span-2">Estado</div>
            <div className="col-span-2 text-right">Acciones</div>
          </div>

          {/* Rows */}
          {rows.length === 0 && (
            <div className="py-20 text-center text-gray-400">
              <span className="material-icons text-5xl mb-3 block text-gray-200">
                apartment
              </span>
              <p className="text-sm">No hay propiedades registradas.</p>
            </div>
          )}

          {rows.map((p, idx) => {
            const thumb =
              (Array.isArray(p.images) && p.images[0]) ||
              PLACEHOLDER_IMAGES[idx % PLACEHOLDER_IMAGES.length];

            return (
              <div
                key={p.id}
                className={`group grid grid-cols-1 md:grid-cols-12 gap-4 px-6 py-5 border-b border-gray-100 dark:border-primary/10 hover:bg-background-light dark:hover:bg-primary/5 transition-colors items-center ${
                  !p.is_active ? 'opacity-60' : ''
                }`}
              >
                {/* Property Details */}
                <div className="col-span-12 md:col-span-6 flex gap-4 items-center">
                  <div className="relative h-20 w-28 flex-shrink-0 rounded-lg overflow-hidden bg-gray-200">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={thumb}
                      alt={p.title}
                      className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                    {!p.is_active && (
                      <div className="absolute inset-0 bg-gray-900/40 flex items-center justify-center">
                        <span className="material-icons text-white text-2xl">visibility_off</span>
                      </div>
                    )}
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-nordic dark:text-white group-hover:text-primary transition-colors cursor-pointer">
                      {p.title}
                    </h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      {p.location}
                    </p>
                    <div className="flex items-center gap-3 mt-1.5 text-xs text-gray-400 dark:text-gray-500">
                      <span className="flex items-center gap-1">
                        <span className="material-icons text-[14px]">bed</span> {p.beds} Camas
                      </span>
                      <span className="w-1 h-1 rounded-full bg-gray-300"></span>
                      <span className="flex items-center gap-1">
                        <span className="material-icons text-[14px]">bathtub</span> {p.baths} Baños
                      </span>
                      {p.type && (
                        <>
                          <span className="w-1 h-1 rounded-full bg-gray-300"></span>
                          <span>{p.type}</span>
                        </>
                      )}
                    </div>
                  </div>
                </div>

                {/* Price */}
                <div className="col-span-6 md:col-span-2">
                  <div className="text-base font-semibold text-nordic dark:text-gray-200">
                    {p.price}
                  </div>
                  <div className="text-xs text-gray-400">
                    {p.price_detail || (p.is_rent ? 'Mensual' : 'Total')}
                  </div>
                </div>

                {/* Status */}
                <div className="col-span-6 md:col-span-2">
                  <StatusBadge isActive={p.is_active} />
                  {p.is_featured && (
                    <div className="mt-1.5 flex items-center gap-1 text-xs text-amber-500">
                      <span className="material-icons text-sm">star</span>
                      Destacada
                    </div>
                  )}
                </div>

                {/* Actions */}
                <div className="col-span-12 md:col-span-2 flex items-center justify-end gap-1">
                  {p.slug && (
                    <Link
                      href={`/${locale}/property/${p.slug}`}
                      target="_blank"
                      className="p-2 rounded-lg text-gray-400 hover:text-primary hover:bg-hint-green/30 transition-all"
                      title="Ver Propiedad"
                    >
                      <span className="material-icons text-xl">open_in_new</span>
                    </Link>
                  )}
                  <Link
                    href={`/${locale}/admin/properties/${p.id}/edit`}
                    className="p-2 rounded-lg text-gray-400 hover:text-primary hover:bg-hint-green/30 transition-all"
                    title="Editar Propiedad"
                  >
                    <span className="material-icons text-xl">edit</span>
                  </Link>
                  <ToggleActiveButton id={p.id} isActive={p.is_active} locale={locale} />
                </div>
              </div>
            );
          })}

          {/* Pagination */}
          <div className="px-6 py-4 border-t border-gray-100 dark:border-primary/20 flex items-center justify-between bg-gray-50/50 dark:bg-primary/5">
            <div className="text-sm text-gray-500 dark:text-gray-400">
              Mostrando <span className="font-medium text-nordic dark:text-white">{Math.min(from + 1, totalCount)}</span> a{' '}
              <span className="font-medium text-nordic dark:text-white">
                {Math.min(to + 1, totalCount)}
              </span>{' '}
              de <span className="font-medium text-nordic dark:text-white">{totalCount}</span> propiedades
            </div>
            <div className="flex gap-2">
              <Link
                href={`/${locale}/admin/properties?page=${Math.max(1, page - 1)}`}
                className={`px-3 py-1 text-sm border border-gray-200 dark:border-primary/30 rounded-md transition-colors ${
                  page <= 1
                    ? 'text-gray-400 bg-gray-50 dark:bg-gray-800 dark:text-gray-600 pointer-events-none'
                    : 'text-gray-600 dark:text-gray-300 hover:bg-white dark:hover:bg-primary/20'
                }`}
                aria-disabled={page <= 1}
              >
                Anterior
              </Link>
              <Link
                href={`/${locale}/admin/properties?page=${page + 1}`}
                className={`px-3 py-1 text-sm border border-gray-200 dark:border-primary/30 rounded-md transition-colors ${
                  to + 1 >= totalCount
                    ? 'text-gray-400 bg-gray-50 dark:bg-gray-800 dark:text-gray-600 pointer-events-none'
                    : 'text-gray-600 dark:text-gray-300 hover:bg-white dark:hover:bg-primary/20'
                }`}
                aria-disabled={to + 1 >= totalCount}
              >
                Siguiente
              </Link>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
