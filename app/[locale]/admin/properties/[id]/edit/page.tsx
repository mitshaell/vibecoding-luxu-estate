import { createClient } from '@/lib/supabase/server';
import PropertyForm from '@/components/admin/PropertyForm';
import Link from 'next/link';
import { notFound } from 'next/navigation';

export default async function EditPropertyPage(props: {
  params: Promise<{ locale: string; id: string }>;
}) {
  const { locale, id } = await props.params;
  const supabase = await createClient();

  const { data: property, error } = await supabase
    .from('properties')
    .select('*')
    .eq('id', id)
    .single();

  if (error || !property) {
    notFound();
  }

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
                <li aria-current="page" className="text-nordic dark:text-white">Edit Property</li>
              </ol>
            </nav>
            <div>
              <h1 className="text-3xl md:text-4xl font-bold text-nordic dark:text-white tracking-tight mb-2">Edit Property</h1>
              <p className="text-base text-gray-500 dark:text-gray-400 max-w-2xl font-normal font-sf-pro">
                Update the details below for this listing. Fields marked with * are mandatory.
              </p>
            </div>
          </div>
        </header>

        <PropertyForm locale={locale} initialData={property} />
      </main>
    </div>
  );
}
