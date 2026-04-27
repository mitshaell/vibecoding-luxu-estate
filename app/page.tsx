import Navbar from "../components/Navbar";
import Hero from "../components/Hero";
import FeaturedPropertyCard from "../components/FeaturedPropertyCard";
import PropertyCard from "../components/PropertyCard";
import Pagination from "../components/Pagination";
import { supabase } from "../lib/supabase";

const PAGE_SIZE = 8;

interface HomePageProps {
  searchParams: Promise<{ 
    page?: string;
    location?: string;
    type?: string;
    beds?: string;
    baths?: string;
  }>;
}

export default async function Home({ searchParams }: HomePageProps) {
  const params = await searchParams;
  const currentPage = Math.max(1, parseInt(params?.page ?? "1", 10));
  
  const location = params?.location;
  const type = params?.type;
  const beds = params?.beds ? parseInt(params.beds, 10) : null;
  const baths = params?.baths ? parseInt(params.baths, 10) : null;

  const from = (currentPage - 1) * PAGE_SIZE;
  const to = from + PAGE_SIZE - 1;

  const featuredQuery = supabase
    .from("properties")
    .select("*")
    .eq("is_featured", true)
    .order("created_at", { ascending: true });

  let marketQuery = supabase
    .from("properties")
    .select("*", { count: "exact" })
    .eq("is_featured", false)
    .order("created_at", { ascending: true });

  if (location) {
    marketQuery = marketQuery.ilike("location", `%${location}%`);
  }
  if (type) {
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
    featuredQuery,
    marketQuery,
  ]);

  const featuredProperties = featuredResult.data ?? [];
  const marketProperties = marketResult.data ?? [];
  const totalCount = marketResult.count ?? 0;
  const totalPages = Math.ceil(totalCount / PAGE_SIZE);

  return (
    <>
      <Navbar />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-20">
        <Hero />

        {/* Featured Collections */}
        <section className="mb-16">
          <div className="flex items-end justify-between mb-8">
            <div>
              <h2 className="text-2xl font-light text-nordic-dark">Featured Collections</h2>
              <p className="text-nordic-muted mt-1 text-sm">Curated properties for the discerning eye.</p>
            </div>
            <a
              className="hidden sm:flex items-center gap-1 text-sm font-medium text-mosque hover:opacity-70 transition-opacity"
              href="#"
            >
              View all <span className="material-icons text-sm">arrow_forward</span>
            </a>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {featuredProperties.map((property) => (
              <FeaturedPropertyCard key={property.id} property={property} />
            ))}
          </div>
        </section>

        {/* New in Market */}
        <section>
          <div className="flex items-end justify-between mb-8">
            <div>
              <h2 className="text-2xl font-light text-nordic-dark">New in Market</h2>
              <p className="text-nordic-muted mt-1 text-sm">
                Fresh opportunities — page {currentPage} of {totalPages}.
              </p>
            </div>
            <div className="hidden md:flex bg-white p-1 rounded-lg">
              <button className="px-4 py-1.5 rounded-md text-sm font-medium bg-nordic-dark text-white shadow-sm">
                All
              </button>
              <button className="px-4 py-1.5 rounded-md text-sm font-medium text-nordic-muted hover:text-nordic-dark">
                Buy
              </button>
              <button className="px-4 py-1.5 rounded-md text-sm font-medium text-nordic-muted hover:text-nordic-dark">
                Rent
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
