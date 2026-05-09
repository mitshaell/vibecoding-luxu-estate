import PropertyForm from '@/components/admin/PropertyForm';
import Link from 'next/link';

export default async function AddPropertyPage(props: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await props.params;

  return (
    <div className="min-h-full bg-background-light dark:bg-background-dark font-display">
      <main className="flex-grow max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <header className="mb-10 flex flex-col md:flex-row md:items-end justify-between gap-6 border-b border-gray-200 dark:border-primary/20 pb-8">
          <div className="space-y-4">
            <nav aria-label="Breadcrumb" className="flex">
              <ol className="flex items-center space-x-2 text-sm text-gray-500 dark:text-gray-400 font-medium font-sf-pro">
                <li>
                  <Link href={`/${locale}/admin/properties`} className="hover:text-primary transition-colors">
                    Properties
                  </Link>
                </li>
                <li><span className="material-icons text-xs text-gray-400">chevron_right</span></li>
                <li aria-current="page" className="text-nordic dark:text-white">Add New</li>
              </ol>
            </nav>
            <div>
              <h1 className="text-3xl md:text-4xl font-bold text-nordic dark:text-white tracking-tight mb-2">Add New Property</h1>
              <p className="text-base text-gray-500 dark:text-gray-400 max-w-2xl font-normal font-sf-pro">
                Fill in the details below to create a new listing. Fields marked with * are mandatory.
              </p>
            </div>
          </div>
        </header>

        <PropertyForm locale={locale} />
      </main>
    </div>
  );
}
