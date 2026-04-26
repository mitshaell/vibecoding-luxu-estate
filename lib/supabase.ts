import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

/**
 * Supabase client — safe to use in Server Components and API routes.
 * For Client Components that need realtime or auth, create a separate browser client.
 */
export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// ─── Types aligned with the `properties` table ───────────────────────────────

export interface Property {
  id: string;
  title: string;
  location: string;
  price: string;
  price_detail: string | null;
  beds: number;
  baths: number;
  area: string;
  slug: string;
  images: string[];
  latitude: number;
  longitude: number;
  type: string;
  is_rent: boolean;
  is_featured: boolean;
  created_at: string;
}

export interface PaginatedProperties {
  data: Property[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}
