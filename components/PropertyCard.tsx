import Image from "next/image";
import Link from "next/link";
import { Property } from "../lib/supabase";

export default function PropertyCard({ property }: { property: Property }) {
  return (
    <Link href={`/property/${property.slug}`} className="block h-full">
      <article className="bg-white rounded-xl overflow-hidden shadow-card hover:shadow-soft transition-all duration-300 group cursor-pointer h-full flex flex-col">
        <div className="relative aspect-[4/3] overflow-hidden">
          <Image
            src={property.images?.[0] || 'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&w=800&q=80'}
            alt={property.title}
            fill
            className="object-cover transition-transform duration-500 group-hover:scale-110"
          />
          <button className="absolute top-3 right-3 p-2 bg-white/90 rounded-full hover:bg-mosque hover:text-white transition-colors text-nordic-dark z-10">
            <span className="material-icons text-lg">favorite_border</span>
          </button>
          <div className={`absolute bottom-3 left-3 text-white text-xs font-bold px-2 py-1 rounded ${property.is_rent ? 'bg-mosque/90' : 'bg-nordic-dark/90'}`}>
            {property.type}
          </div>
        </div>
        <div className="p-4 flex flex-col flex-grow">
          <div className="flex justify-between items-baseline mb-2">
            <h3 className="font-bold text-lg text-nordic-dark">
              {property.price}
              {property.price_detail && <span className="text-sm font-normal text-nordic-muted">{property.price_detail}</span>}
            </h3>
          </div>
          <h4 className="text-nordic-dark font-medium truncate mb-1">{property.title}</h4>
          <p className="text-nordic-muted text-xs mb-4">{property.location}</p>
          <div className="mt-auto flex items-center justify-between pt-3 border-t border-gray-100">
            <div className="flex items-center gap-1 text-nordic-muted text-xs">
              <span className="material-icons text-sm text-mosque/80">king_bed</span> {property.beds}
            </div>
            <div className="flex items-center gap-1 text-nordic-muted text-xs">
              <span className="material-icons text-sm text-mosque/80">bathtub</span> {property.baths}
            </div>
            <div className="flex items-center gap-1 text-nordic-muted text-xs">
              <span className="material-icons text-sm text-mosque/80">square_foot</span> {property.area}
            </div>
          </div>
        </div>
      </article>
    </Link>
  );
}
