import Navbar from "../../components/Navbar";
import Hero from "../../components/Hero";
import FeaturedPropertyCard from "../../components/FeaturedPropertyCard";
import PropertyCard from "../../components/PropertyCard";
import Pagination from "../../components/Pagination";
import { supabase } from "../../lib/supabase";
import { getDictionary, Locale } from "../../lib/i18n";

const PAGE_SIZE = 8;

interface HomePageProps {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ 
    page?: string;
    location?: string;
    type?: string;
    beds?: string;
    baths?: string;
  }>;
}

export default async function Home({ params, searchParams }: HomePageProps) {
  const resolvedParams = await params;
  const locale = resolvedParams.locale as Locale;
  const dict = await getDictionary(locale);

  const resolvedSearchParams = await searchParams;
  const currentPage = Math.max(1, parseInt(resolvedSearchParams?.page ?? "1", 10));
  
  const location = resolvedSearchParams?.location;
  const type = resolvedSearchParams?.type;
  const beds = resolvedSearchParams?.beds ? parseInt(resolvedSearchParams.beds, 10) : null;
  const baths = resolvedSearchParams?.baths ? parseInt(resolvedSearchParams.baths, 10) : null;

  const isFilterApplied = Boolean(location || type || beds || baths);

  const from = (currentPage - 1) * PAGE_SIZE;
  const to = from + PAGE_SIZE - 1;

  const featuredQuery = supabase
    .from("properties")
    .select("*")
    .eq("is_featured", true)
    .order("created_at", { ascending: true })
    .limit(2);

  let marketQuery = supabase
    .from("properties")
    .select("*", { count: "exact" })
    .eq("is_featured", false)
    .order("created_at", { ascending: true });

  if (location) {
    marketQuery = marketQuery.ilike("location", `%${location}%`);
  }
  if (type) {
    // English type mappings to query the database, or we map back?
    // Wait, if the user searches for "Casa" and URL says type=Casa
    // It's probably easier to keep English types in the DB and URL, and only translate display labels.
    // Or just query as is if we assume UI handles mapping. 
    // We will assume UI passes the English value or actual DB value in the URL for now, or we'll pass English in the URL but show translated.
    marketQuery = marketQuery.eq("type", type);
  }
  if (beds) {
    marketQuery = marketQuery.gte("beds", beds);
  }
  if (baths) {
    marketQuery = marketQuery.gte("baths", baths);
  }

  marketQuery = marketQuery.range(from, to);

  const [featuredResult, marketResult] = await Promise.all([
    isFilterApplied ? Promise.resolve({ data: [] }) : featuredQuery,
    marketQuery,
  ]);

  const featuredProperties = featuredResult.data ?? [];
  const marketProperties = marketResult.data ?? [];
  const totalCount = marketResult.count ?? 0;
  const totalPages = Math.ceil(totalCount / PAGE_SIZE);

  return (
    <>
      <Navbar dict={dict} locale={locale} />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-20">
        <Hero dict={dict} />

        {/* Featured Collections */}
        {!isFilterApplied && featuredProperties.length > 0 && (
          <section className="mb-16">
            <div className="flex items-end justify-between mb-8">
            <div>
              <h2 className="text-2xl font-light text-nordic-dark">{dict.home.featuredCollections}</h2>
              <p className="text-nordic-muted mt-1 text-sm">{dict.home.featuredSubtitle}</p>
            </div>
            <a
              className="hidden sm:flex items-center gap-1 text-sm font-medium text-mosque hover:opacity-70 transition-opacity"
              href="#"
            >
              {dict.home.viewAll} <span className="material-icons text-sm">arrow_forward</span>
            </a>
          </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {featuredProperties.map((property) => (
                <FeaturedPropertyCard key={property.id} property={property} />
              ))}
            </div>
          </section>
        )}

        {/* New in Market */}
        <section>
          <div className="flex items-end justify-between mb-8">
            <div>
              <h2 className="text-2xl font-light text-nordic-dark">{dict.home.newInMarket}</h2>
              <p className="text-nordic-muted mt-1 text-sm">
                {dict.home.newSubtitle.replace('{currentPage}', currentPage.toString()).replace('{totalPages}', totalPages.toString())}
              </p>
            </div>
            <div className="hidden md:flex bg-white p-1 rounded-lg">
              <button className="px-4 py-1.5 rounded-md text-sm font-medium bg-nordic-dark text-white shadow-sm">
                {dict.home.all}
              </button>
              <button className="px-4 py-1.5 rounded-md text-sm font-medium text-nordic-muted hover:text-nordic-dark">
                {dict.home.buy}
              </button>
              <button className="px-4 py-1.5 rounded-md text-sm font-medium text-nordic-muted hover:text-nordic-dark">
                {dict.home.rent}
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {marketProperties.map((property) => (
              <PropertyCard key={property.id} property={property} />
            ))}
          </div>

          <Pagination currentPage={currentPage} totalPages={totalPages} />
        </section>
      </main>
    </>
  );
}
