"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";

interface SearchFiltersModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function SearchFiltersModal({ isOpen, onClose }: SearchFiltersModalProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [location, setLocation] = useState("");
  const [minPrice, setMinPrice] = useState("");
  const [maxPrice, setMaxPrice] = useState("");
  const [propertyType, setPropertyType] = useState("Any Type");
  const [beds, setBeds] = useState(0);
  const [baths, setBaths] = useState(0);
  const [amenities, setAmenities] = useState<string[]>([]);

  // Reset to current URL params when opened
  useEffect(() => {
    if (isOpen) {
      setLocation(searchParams?.get("location") || "");
      setMinPrice(searchParams?.get("minPrice") || "");
      setMaxPrice(searchParams?.get("maxPrice") || "");
      setPropertyType(searchParams?.get("type") || "Any Type");
      setBeds(parseInt(searchParams?.get("beds") || "0", 10));
      setBaths(parseInt(searchParams?.get("baths") || "0", 10));
    }
  }, [isOpen, searchParams]);

  if (!isOpen) return null;

  const handleApply = () => {
    const params = new URLSearchParams(searchParams?.toString() || "");
    if (location) params.set("location", location);
    else params.delete("location");

    if (minPrice) params.set("minPrice", minPrice);
    else params.delete("minPrice");

    if (maxPrice) params.set("maxPrice", maxPrice);
    else params.delete("maxPrice");

    if (propertyType && propertyType !== "Any Type") params.set("type", propertyType);
    else params.delete("type");

    if (beds > 0) params.set("beds", beds.toString());
    else params.delete("beds");

    if (baths > 0) params.set("baths", baths.toString());
    else params.delete("baths");

    params.set("page", "1"); // Reset to page 1

    router.push(`/?${params.toString()}`);
    onClose();
  };

  const clearAll = () => {
    setLocation("");
    setMinPrice("");
    setMaxPrice("");
    setPropertyType("Any Type");
    setBeds(0);
    setBaths(0);
    setAmenities([]);
  };

  const toggleAmenity = (amenity: string) => {
    setAmenities(prev => 
      prev.includes(amenity) ? prev.filter(a => a !== amenity) : [...prev, amenity]
    );
  };

  return (
    <>
      {/* Modal Overlay */}
      <div 
        className="fixed inset-0 bg-gray-900/40 backdrop-blur-sm z-40 transition-opacity"
        onClick={onClose}
      ></div>

      {/* Main Modal Container */}
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none">
        <main className="relative w-full max-w-2xl bg-white text-nordic-dark rounded-xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh] pointer-events-auto">
          {/* Header */}
          <header className="px-8 py-6 border-b border-gray-100 flex justify-between items-center bg-white sticky top-0 z-30">
            <h1 className="text-2xl font-semibold tracking-tight">Filters</h1>
            <button 
              onClick={onClose}
              className="p-2 rounded-full hover:bg-gray-100 transition-colors text-nordic-muted"
            >
              <span className="material-icons">close</span>
            </button>
          </header>

          {/* Scrollable Content */}
          <div className="flex-1 overflow-y-auto scrollbar-hide p-8 space-y-10">
            
            {/* Section 1: Location */}
            <section>
              <label className="block text-xs font-semibold text-nordic-muted uppercase tracking-wider mb-3">Location</label>
              <div className="relative group">
                <span className="material-icons absolute left-4 top-3.5 text-nordic-muted/60 group-focus-within:text-mosque transition-colors">location_on</span>
                <input 
                  className="w-full pl-12 pr-4 py-3 bg-gray-50 border border-transparent rounded-lg text-nordic-dark placeholder-nordic-muted focus:border-mosque focus:ring-1 focus:ring-mosque focus:bg-white transition-all shadow-sm" 
                  placeholder="City, neighborhood, or address" 
                  type="text" 
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                />
              </div>
            </section>

            {/* Section 2: Price Range */}
            <section>
              <div className="flex justify-between items-end mb-4">
                <label className="block text-xs font-semibold text-nordic-muted uppercase tracking-wider">Price Range</label>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-gray-50 p-3 rounded-lg border border-transparent focus-within:border-mosque/30 transition-colors">
                  <label className="block text-[10px] text-nordic-muted uppercase font-medium mb-1">Min Price</label>
                  <div className="flex items-center">
                    <span className="text-nordic-muted/60 mr-1">$</span>
                    <input 
                      className="w-full bg-transparent border-0 p-0 text-nordic-dark font-medium focus:ring-0 text-sm" 
                      type="number" 
                      placeholder="e.g. 1000000"
                      value={minPrice}
                      onChange={(e) => setMinPrice(e.target.value)}
                    />
                  </div>
                </div>
                
                <div className="bg-gray-50 p-3 rounded-lg border border-transparent focus-within:border-mosque/30 transition-colors">
                  <label className="block text-[10px] text-nordic-muted uppercase font-medium mb-1">Max Price</label>
                  <div className="flex items-center">
                    <span className="text-nordic-muted/60 mr-1">$</span>
                    <input 
                      className="w-full bg-transparent border-0 p-0 text-nordic-dark font-medium focus:ring-0 text-sm" 
                      type="number" 
                      placeholder="e.g. 5000000"
                      value={maxPrice}
                      onChange={(e) => setMaxPrice(e.target.value)}
                    />
                  </div>
                </div>
              </div>
            </section>

            {/* Section 3: Property Details */}
            <section className="grid grid-cols-1 md:grid-cols-2 gap-8">
              
              {/* Property Type */}
              <div className="space-y-3">
                <label className="block text-xs font-semibold text-nordic-muted uppercase tracking-wider">Property Type</label>
                <div className="relative">
                  <select 
                    className="w-full bg-gray-50 border border-transparent rounded-lg py-3 pl-4 pr-10 text-nordic-dark appearance-none focus:border-mosque focus:ring-1 focus:ring-mosque cursor-pointer"
                    value={propertyType}
                    onChange={(e) => setPropertyType(e.target.value)}
                  >
                    <option>Any Type</option>
                    <option>House</option>
                    <option>Apartment</option>
                    <option>Condo</option>
                    <option>Villa</option>
                    <option>Penthouse</option>
                    <option>Townhouse</option>
                  </select>
                  <span className="material-icons absolute right-3 top-3 text-nordic-muted/60 pointer-events-none">expand_more</span>
                </div>
              </div>

              {/* Rooms */}
              <div className="space-y-4">
                {/* Beds */}
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium text-nordic-dark">Bedrooms</span>
                  <div className="flex items-center space-x-3 bg-gray-50 rounded-full p-1">
                    <button 
                      onClick={() => setBeds(Math.max(0, beds - 1))}
                      className="w-8 h-8 rounded-full bg-white shadow-sm flex items-center justify-center text-nordic-muted hover:text-mosque disabled:opacity-50 transition-colors"
                    >
                      <span className="material-icons text-base">remove</span>
                    </button>
                    <span className="text-sm font-semibold w-4 text-center">{beds > 0 ? `${beds}+` : 'Any'}</span>
                    <button 
                      onClick={() => setBeds(beds + 1)}
                      className="w-8 h-8 rounded-full bg-white shadow-sm flex items-center justify-center text-mosque hover:bg-mosque hover:text-white transition-colors"
                    >
                      <span className="material-icons text-base">add</span>
                    </button>
                  </div>
                </div>

                {/* Baths */}
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium text-nordic-dark">Bathrooms</span>
                  <div className="flex items-center space-x-3 bg-gray-50 rounded-full p-1">
                    <button 
                      onClick={() => setBaths(Math.max(0, baths - 1))}
                      className="w-8 h-8 rounded-full bg-white shadow-sm flex items-center justify-center text-nordic-muted hover:text-mosque transition-colors"
                    >
                      <span className="material-icons text-base">remove</span>
                    </button>
                    <span className="text-sm font-semibold w-4 text-center">{baths > 0 ? `${baths}+` : 'Any'}</span>
                    <button 
                      onClick={() => setBaths(baths + 1)}
                      className="w-8 h-8 rounded-full bg-white shadow-sm flex items-center justify-center text-mosque hover:bg-mosque hover:text-white transition-colors"
                    >
                      <span className="material-icons text-base">add</span>
                    </button>
                  </div>
                </div>
              </div>
            </section>

            {/* Section 4: Amenities */}
            <section>
              <label className="block text-xs font-semibold text-nordic-muted uppercase tracking-wider mb-4">Amenities & Features</label>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {[
                  { id: 'pool', icon: 'pool', label: 'Swimming Pool' },
                  { id: 'gym', icon: 'fitness_center', label: 'Gym' },
                  { id: 'parking', icon: 'local_parking', label: 'Parking' },
                  { id: 'ac', icon: 'ac_unit', label: 'Air Conditioning' },
                  { id: 'wifi', icon: 'wifi', label: 'High-speed Wifi' },
                  { id: 'patio', icon: 'deck', label: 'Patio / Terrace' },
                ].map((amenity) => {
                  const isActive = amenities.includes(amenity.id);
                  return (
                    <label key={amenity.id} className="cursor-pointer group relative">
                      <input 
                        className="peer sr-only" 
                        type="checkbox" 
                        checked={isActive}
                        onChange={() => toggleAmenity(amenity.id)}
                      />
                      <div className={`h-full px-4 py-3 rounded-lg border text-sm flex items-center justify-center gap-2 transition-all ${
                        isActive 
                          ? 'border-mosque bg-mosque/5 text-mosque font-medium' 
                          : 'border-gray-200 bg-white text-nordic-muted hover:border-gray-300'
                      }`}>
                        <span className={`material-icons text-lg ${isActive ? 'text-mosque' : 'text-nordic-muted/60 group-hover:text-nordic-muted'}`}>
                          {amenity.icon}
                        </span>
                        {amenity.label}
                      </div>
                      {isActive && (
                        <div className="absolute top-2 right-2 w-2 h-2 bg-mosque rounded-full opacity-100 transition-opacity"></div>
                      )}
                    </label>
                  );
                })}
              </div>
            </section>
          </div>

          {/* Footer */}
          <footer className="bg-white border-t border-gray-100 px-8 py-6 sticky bottom-0 z-30 flex items-center justify-between">
            <button 
              onClick={clearAll}
              className="text-sm font-medium text-nordic-muted hover:text-nordic-dark transition-colors underline decoration-gray-300 underline-offset-4"
            >
              Clear all filters
            </button>
            <button 
              onClick={handleApply}
              className="bg-mosque hover:bg-mosque/90 text-white px-8 py-3 rounded-lg font-medium shadow-lg shadow-mosque/30 transition-all hover:shadow-mosque/40 flex items-center gap-2 transform active:scale-95"
            >
              Show Homes
              <span className="material-icons text-sm">arrow_forward</span>
            </button>
          </footer>
        </main>
      </div>
    </>
  );
}
