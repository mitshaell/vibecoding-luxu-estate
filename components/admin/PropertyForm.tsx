'use client';

import { useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '../../lib/supabase/client';
import Image from 'next/image';

interface PropertyFormProps {
  locale: string;
  initialData?: any; // To be typed properly if needed
}

const AMENITIES_LIST = [
  'Swimming Pool',
  'Garden',
  'Air Conditioning',
  'Smart Home',
  'Balcony',
  'Gym',
  'Security System',
  'Elevator',
];

export default function PropertyForm({ locale, initialData }: PropertyFormProps) {
  const router = useRouter();
  const supabase = createClient();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    title: initialData?.title || '',
    price: initialData?.price || '',
    status: initialData?.is_rent ? 'for-rent' : 'for-sale',
    type: initialData?.type || 'house',
    description: initialData?.description || '',
    location: initialData?.location || '',
    latitude: initialData?.latitude || '',
    longitude: initialData?.longitude || '',
    area: initialData?.area || '',
    year_built: initialData?.year_built || '',
    beds: initialData?.beds || 0,
    baths: initialData?.baths || 0,
    parking: initialData?.parking || 0,
    amenities: initialData?.amenities || ([] as string[]),
    images: initialData?.images || ([] as string[]),
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { id, value } = e.target;
    setFormData((prev) => ({ ...prev, [id]: value }));
  };

  const handleNumberChange = (field: 'beds' | 'baths' | 'parking', delta: number) => {
    setFormData((prev) => ({
      ...prev,
      [field]: Math.max(0, parseInt(prev[field] as any) + delta),
    }));
  };

  const toggleAmenity = (amenity: string) => {
    setFormData((prev) => {
      const exists = prev.amenities.includes(amenity);
      if (exists) {
        return { ...prev, amenities: prev.amenities.filter((a: string) => a !== amenity) };
      }
      return { ...prev, amenities: [...prev.amenities, amenity] };
    });
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return;
    
    setUploading(true);
    setError(null);
    const newImages: string[] = [];

    for (const file of Array.from(e.target.files)) {
      const fileExt = file.name.split('.').pop();
      const fileName = `${Math.random()}.${fileExt}`;
      const filePath = `${Date.now()}-${fileName}`;

      const { error: uploadError, data } = await supabase.storage
        .from('properties')
        .upload(filePath, file);

      if (uploadError) {
        setError(`Error uploading image: ${uploadError.message}`);
        continue;
      }

      const { data: publicUrlData } = supabase.storage
        .from('properties')
        .getPublicUrl(filePath);

      if (publicUrlData) {
        newImages.push(publicUrlData.publicUrl);
      }
    }

    setFormData((prev) => ({ ...prev, images: [...prev.images, ...newImages] }));
    setUploading(false);
    
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const removeImage = (index: number) => {
    setFormData((prev) => {
      const newImages = [...prev.images];
      newImages.splice(index, 1);
      return { ...prev, images: newImages };
    });
  };

  const setMainImage = (index: number) => {
    setFormData((prev) => {
      const newImages = [...prev.images];
      const selected = newImages.splice(index, 1)[0];
      newImages.unshift(selected); // Move to front
      return { ...prev, images: newImages };
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const payload = {
      title: formData.title,
      price: formData.price,
      is_rent: formData.status === 'for-rent',
      type: formData.type,
      description: formData.description,
      location: formData.location,
      latitude: formData.latitude ? parseFloat(formData.latitude as string) : null,
      longitude: formData.longitude ? parseFloat(formData.longitude as string) : null,
      area: formData.area.toString(),
      year_built: formData.year_built ? parseInt(formData.year_built) : null,
      beds: formData.beds,
      baths: formData.baths,
      parking: formData.parking,
      amenities: formData.amenities,
      images: formData.images,
    };

    if (!initialData?.id) {
      const baseSlug = formData.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');
      payload.slug = `${baseSlug}-${Math.floor(Math.random() * 10000)}`;
    }

    let resultError;

    if (initialData?.id) {
      const { error } = await supabase
        .from('properties')
        .update(payload)
        .eq('id', initialData.id);
      resultError = error;
    } else {
      const { error } = await supabase
        .from('properties')
        .insert([payload]);
      resultError = error;
    }

    if (resultError) {
      setError(resultError.message);
      setLoading(false);
    } else {
      router.push(`/${locale}/admin/properties`);
      router.refresh();
    }
  };

  return (
    <form onSubmit={handleSubmit} className="grid grid-cols-1 xl:grid-cols-12 gap-8 items-start pb-20 md:pb-0">
      {error && (
        <div className="xl:col-span-12 p-4 mb-4 text-sm text-red-800 rounded-lg bg-red-50 dark:bg-gray-800 dark:text-red-400" role="alert">
          {error}
        </div>
      )}

      {/* Main Form Area */}
      <div className="xl:col-span-8 space-y-8">
        
        {/* Basic Information */}
        <div className="bg-white dark:bg-[#152e2a] rounded-xl shadow-sm border border-gray-100 dark:border-primary/20 overflow-hidden">
          <div className="px-8 py-6 border-b border-hint-green/30 dark:border-primary/20 flex items-center gap-3 bg-gradient-to-r from-hint-green/10 to-transparent dark:from-primary/10">
            <div className="w-8 h-8 rounded-full bg-hint-green flex items-center justify-center text-nordic">
              <span className="material-icons text-lg">info</span>
            </div>
            <h2 className="text-xl font-bold text-nordic dark:text-white">Basic Information</h2>
          </div>
          <div className="p-8 space-y-6">
            <div className="group">
              <label htmlFor="title" className="block text-sm font-medium text-nordic dark:text-gray-300 mb-1.5 font-sf-pro">
                Property Title <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                id="title"
                required
                value={formData.title}
                onChange={handleChange}
                className="w-full text-base px-4 py-2.5 rounded-md border-gray-200 dark:border-primary/30 bg-white dark:bg-background-dark text-nordic dark:text-white placeholder-gray-400 focus:ring-1 focus:ring-primary focus:border-primary transition-all font-sf-pro"
                placeholder="e.g. Modern Penthouse with Ocean View"
              />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <label htmlFor="price" className="block text-sm font-medium text-nordic dark:text-gray-300 mb-1.5 font-sf-pro">
                  Price <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 font-sf-pro text-sm">$</span>
                  <input
                    type="text"
                    id="price"
                    required
                    value={formData.price}
                    onChange={handleChange}
                    className="w-full pl-7 pr-4 py-2.5 rounded-md border-gray-200 dark:border-primary/30 bg-white dark:bg-background-dark text-nordic dark:text-white placeholder-gray-400 focus:ring-1 focus:ring-primary focus:border-primary transition-all text-base font-medium font-sf-pro"
                    placeholder="0.00"
                  />
                </div>
              </div>
              <div>
                <label htmlFor="status" className="block text-sm font-medium text-nordic dark:text-gray-300 mb-1.5 font-sf-pro">
                  Status
                </label>
                <select
                  id="status"
                  value={formData.status}
                  onChange={handleChange}
                  className="w-full px-4 py-2.5 rounded-md border-gray-200 dark:border-primary/30 bg-white dark:bg-background-dark text-nordic dark:text-white focus:ring-1 focus:ring-primary focus:border-primary transition-all text-base font-sf-pro cursor-pointer"
                >
                  <option value="for-sale">For Sale</option>
                  <option value="for-rent">For Rent</option>
                  <option value="sold">Sold</option>
                </select>
              </div>
              <div>
                <label htmlFor="type" className="block text-sm font-medium text-nordic dark:text-gray-300 mb-1.5 font-sf-pro">
                  Property Type
                </label>
                <select
                  id="type"
                  value={formData.type}
                  onChange={handleChange}
                  className="w-full px-4 py-2.5 rounded-md border-gray-200 dark:border-primary/30 bg-white dark:bg-background-dark text-nordic dark:text-white focus:ring-1 focus:ring-primary focus:border-primary transition-all text-base font-sf-pro cursor-pointer"
                >
                  <option value="apartment">Apartment</option>
                  <option value="house">House</option>
                  <option value="villa">Villa</option>
                  <option value="commercial">Commercial</option>
                </select>
              </div>
            </div>
          </div>
        </div>

        {/* Description */}
        <div className="bg-white dark:bg-[#152e2a] rounded-xl shadow-sm border border-gray-100 dark:border-primary/20 overflow-hidden">
          <div className="px-8 py-6 border-b border-hint-green/30 dark:border-primary/20 flex items-center gap-3 bg-gradient-to-r from-hint-green/10 to-transparent dark:from-primary/10">
            <div className="w-8 h-8 rounded-full bg-hint-green flex items-center justify-center text-nordic">
              <span className="material-icons text-lg">description</span>
            </div>
            <h2 className="text-xl font-bold text-nordic dark:text-white">Description</h2>
          </div>
          <div className="p-8">
            <div className="mb-3 flex gap-2 border-b border-gray-100 dark:border-primary/20 pb-2">
              <button type="button" className="p-1.5 text-gray-400 hover:text-nordic dark:hover:text-white hover:bg-gray-50 dark:hover:bg-primary/10 rounded transition-colors"><span className="material-icons text-lg">format_bold</span></button>
              <button type="button" className="p-1.5 text-gray-400 hover:text-nordic dark:hover:text-white hover:bg-gray-50 dark:hover:bg-primary/10 rounded transition-colors"><span className="material-icons text-lg">format_italic</span></button>
              <button type="button" className="p-1.5 text-gray-400 hover:text-nordic dark:hover:text-white hover:bg-gray-50 dark:hover:bg-primary/10 rounded transition-colors"><span className="material-icons text-lg">format_list_bulleted</span></button>
            </div>
            <textarea
              id="description"
              value={formData.description}
              onChange={handleChange}
              className="w-full px-4 py-3 rounded-md border-gray-200 dark:border-primary/30 bg-white dark:bg-background-dark text-nordic dark:text-white placeholder-gray-400 focus:ring-1 focus:ring-primary focus:border-primary transition-all text-base font-sf-pro leading-relaxed resize-y min-h-[200px]"
              placeholder="Describe the property features, neighborhood, and unique selling points..."
            />
            <div className="mt-2 text-right text-xs text-gray-400 font-sf-pro">
              {formData.description?.length || 0} / 2000 characters
            </div>
          </div>
        </div>

        {/* Gallery */}
        <div className="bg-white dark:bg-[#152e2a] rounded-xl shadow-sm border border-gray-100 dark:border-primary/20 overflow-hidden">
          <div className="px-8 py-6 border-b border-hint-green/30 dark:border-primary/20 flex justify-between items-center bg-gradient-to-r from-hint-green/10 to-transparent dark:from-primary/10">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-hint-green flex items-center justify-center text-nordic">
                <span className="material-icons text-lg">image</span>
              </div>
              <h2 className="text-xl font-bold text-nordic dark:text-white">Gallery</h2>
            </div>
            <span className="text-xs font-medium text-gray-500 bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded font-sf-pro">JPG, PNG, WEBP</span>
          </div>
          <div className="p-8">
            <div 
              className="relative border-2 border-dashed border-gray-300 dark:border-primary/40 rounded-xl bg-gray-50/50 dark:bg-primary/5 p-10 text-center hover:bg-hint-green/10 dark:hover:bg-primary/10 transition-colors cursor-pointer group"
              onClick={() => fileInputRef.current?.click()}
            >
              <input
                type="file"
                multiple
                ref={fileInputRef}
                onChange={handleImageUpload}
                className="hidden"
                accept="image/*"
              />
              <div className="flex flex-col items-center justify-center space-y-3">
                <div className="w-12 h-12 bg-white dark:bg-[#152e2a] rounded-full flex items-center justify-center shadow-sm text-primary group-hover:scale-110 transition-transform duration-300">
                  {uploading ? (
                    <span className="material-icons text-2xl animate-spin">refresh</span>
                  ) : (
                    <span className="material-icons text-2xl">cloud_upload</span>
                  )}
                </div>
                <div className="space-y-1">
                  <p className="text-base font-medium text-nordic dark:text-gray-300 font-sf-pro">
                    {uploading ? 'Uploading...' : 'Click or drag images here'}
                  </p>
                  <p className="text-xs text-gray-400 font-sf-pro">Max file size 5MB per image</p>
                </div>
              </div>
            </div>

            {formData.images.length > 0 && (
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-6">
                {formData.images.map((img: string, idx: number) => (
                  <div key={idx} className="aspect-square rounded-lg overflow-hidden relative group shadow-sm">
                    <img src={img} alt={`Gallery ${idx}`} className="w-full h-full object-cover" />
                    <div className="absolute inset-0 bg-nordic/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2 backdrop-blur-[2px]">
                      <button
                        type="button"
                        onClick={() => removeImage(idx)}
                        className="w-8 h-8 rounded-full bg-white text-red-500 hover:bg-red-50 flex items-center justify-center transition-colors"
                      >
                        <span className="material-icons text-sm">delete</span>
                      </button>
                      {idx !== 0 && (
                        <button
                          type="button"
                          onClick={() => setMainImage(idx)}
                          title="Set as Main"
                          className="w-8 h-8 rounded-full bg-white text-nordic hover:bg-gray-50 flex items-center justify-center transition-colors"
                        >
                          <span className="material-icons text-sm">star</span>
                        </button>
                      )}
                    </div>
                    {idx === 0 && (
                      <span className="absolute top-2 left-2 bg-primary text-white text-[10px] font-bold px-2 py-0.5 rounded shadow-sm font-sf-pro uppercase tracking-wider">Main</span>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Sidebar Area */}
      <div className="xl:col-span-4 space-y-8">
        
        {/* Location */}
        <div className="bg-white dark:bg-[#152e2a] rounded-xl shadow-sm border border-gray-100 dark:border-primary/20 overflow-hidden">
          <div className="px-6 py-4 border-b border-hint-green/30 dark:border-primary/20 flex items-center gap-3 bg-gradient-to-r from-hint-green/10 to-transparent dark:from-primary/10">
            <div className="w-8 h-8 rounded-full bg-hint-green flex items-center justify-center text-nordic">
              <span className="material-icons text-lg">place</span>
            </div>
            <h2 className="text-lg font-bold text-nordic dark:text-white">Location</h2>
          </div>
          <div className="p-6 space-y-4">
            <div>
              <label htmlFor="location" className="block text-sm font-medium text-nordic dark:text-gray-300 mb-1.5 font-sf-pro">Address</label>
              <input
                type="text"
                id="location"
                value={formData.location}
                onChange={handleChange}
                className="w-full px-4 py-2.5 rounded-md border-gray-200 dark:border-primary/30 bg-white dark:bg-background-dark text-nordic dark:text-white placeholder-gray-400 focus:ring-1 focus:ring-primary focus:border-primary transition-all text-sm font-sf-pro"
                placeholder="Street Address, City, Zip"
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label htmlFor="latitude" className="block text-xs font-medium text-nordic dark:text-gray-300 mb-1.5 font-sf-pro">
                  <span className="flex items-center gap-1">
                    <span className="material-icons text-xs text-primary">my_location</span>
                    Latitude
                  </span>
                </label>
                <input
                  type="number"
                  id="latitude"
                  step="any"
                  value={formData.latitude}
                  onChange={handleChange}
                  className="w-full px-3 py-2.5 rounded-md border-gray-200 dark:border-primary/30 bg-white dark:bg-background-dark text-nordic dark:text-white placeholder-gray-400 focus:ring-1 focus:ring-primary focus:border-primary transition-all text-sm font-sf-pro"
                  placeholder="18.4861"
                />
              </div>
              <div>
                <label htmlFor="longitude" className="block text-xs font-medium text-nordic dark:text-gray-300 mb-1.5 font-sf-pro">
                  <span className="flex items-center gap-1">
                    <span className="material-icons text-xs text-primary">my_location</span>
                    Longitude
                  </span>
                </label>
                <input
                  type="number"
                  id="longitude"
                  step="any"
                  value={formData.longitude}
                  onChange={handleChange}
                  className="w-full px-3 py-2.5 rounded-md border-gray-200 dark:border-primary/30 bg-white dark:bg-background-dark text-nordic dark:text-white placeholder-gray-400 focus:ring-1 focus:ring-primary focus:border-primary transition-all text-sm font-sf-pro"
                  placeholder="-69.9312"
                />
              </div>
            </div>
            <div className="relative h-48 w-full rounded-lg overflow-hidden bg-gray-100 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 group">
              <img src="https://lh3.googleusercontent.com/aida-public/AB6AXuAS55FY7gfArnlTpNsdabJk9nBO5uQJgOwIsl8beO34JRZ9dMmjLoIkTuTUO72Y9L5tUmQqTReQWebUWadAWwLusGmRQiIict5sqY--yRaOxuYpTzfR4vv4RKh1ex6oxY64e0kbSeMudNO6pv-gG0WzVWs-pDfvQm5IoTQ1mT-tAV49LDkXAHZl317M1-D7eZw3N8o2ExKWTgg6oMAXOFVnkApIqnb7TZHekwSw8pWQxpJV2EKI8EQKQbQXJaSbjN8gB1n8b-ueWj8" alt="Map view" className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-all duration-500" />
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                <span className="bg-white/90 dark:bg-[#152e2a]/90 text-nordic dark:text-white px-3 py-1.5 rounded shadow-sm backdrop-blur-sm text-xs font-bold font-sf-pro flex items-center gap-1">
                  <span className="material-icons text-sm text-primary">map</span> Preview
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Details */}
        <div className="bg-white dark:bg-[#152e2a] rounded-xl shadow-sm border border-gray-100 dark:border-primary/20 overflow-hidden sticky top-24">
          <div className="px-6 py-4 border-b border-hint-green/30 dark:border-primary/20 flex items-center gap-3 bg-gradient-to-r from-hint-green/10 to-transparent dark:from-primary/10">
            <div className="w-8 h-8 rounded-full bg-hint-green flex items-center justify-center text-nordic">
              <span className="material-icons text-lg">straighten</span>
            </div>
            <h2 className="text-lg font-bold text-nordic dark:text-white">Details</h2>
          </div>
          <div className="p-6 space-y-6">
            <div className="grid grid-cols-2 gap-4">
              <div className="group">
                <label htmlFor="area" className="text-xs text-gray-500 dark:text-gray-400 font-medium font-sf-pro mb-1 block">Area (m²)</label>
                <input
                  type="text"
                  id="area"
                  value={formData.area}
                  onChange={handleChange}
                  className="w-full text-left px-3 py-2 rounded border-gray-200 dark:border-primary/30 bg-gray-50 dark:bg-background-dark text-nordic dark:text-white focus:bg-white dark:focus:bg-background-dark focus:ring-1 focus:ring-primary focus:border-primary transition-all font-sf-pro text-sm"
                  placeholder="0"
                />
              </div>
              <div className="group">
                <label htmlFor="year_built" className="text-xs text-gray-500 dark:text-gray-400 font-medium font-sf-pro mb-1 block">Year Built</label>
                <input
                  type="number"
                  id="year_built"
                  value={formData.year_built}
                  onChange={handleChange}
                  className="w-full text-left px-3 py-2 rounded border-gray-200 dark:border-primary/30 bg-gray-50 dark:bg-background-dark text-nordic dark:text-white focus:bg-white dark:focus:bg-background-dark focus:ring-1 focus:ring-primary focus:border-primary transition-all font-sf-pro text-sm"
                  placeholder="YYYY"
                />
              </div>
            </div>
            
            <hr className="border-gray-100 dark:border-gray-800" />
            
            <div className="space-y-4">
              {['beds', 'baths', 'parking'].map((field) => (
                <div key={field} className="flex items-center justify-between">
                  <label className="text-sm font-medium text-nordic dark:text-gray-300 font-sf-pro flex items-center gap-2 capitalize">
                    <span className="material-icons text-gray-400 text-sm">
                      {field === 'beds' ? 'bed' : field === 'baths' ? 'shower' : 'directions_car'}
                    </span> {field}
                  </label>
                  <div className="flex items-center border border-gray-200 dark:border-primary/30 rounded-md overflow-hidden bg-white dark:bg-background-dark shadow-sm">
                    <button
                      type="button"
                      onClick={() => handleNumberChange(field as any, -1)}
                      className="w-8 h-8 flex items-center justify-center hover:bg-gray-50 dark:hover:bg-primary/10 text-gray-600 dark:text-gray-300 transition-colors border-r border-gray-100 dark:border-primary/30"
                    >
                      -
                    </button>
                    <input
                      type="text"
                      readOnly
                      value={(formData as any)[field]}
                      className="w-10 text-center border-none bg-transparent text-nordic dark:text-white p-0 focus:ring-0 text-sm font-medium font-sf-pro"
                    />
                    <button
                      type="button"
                      onClick={() => handleNumberChange(field as any, 1)}
                      className="w-8 h-8 flex items-center justify-center hover:bg-gray-50 dark:hover:bg-primary/10 text-gray-600 dark:text-gray-300 transition-colors border-l border-gray-100 dark:border-primary/30"
                    >
                      +
                    </button>
                  </div>
                </div>
              ))}
            </div>

            <hr className="border-gray-100 dark:border-gray-800" />

            <div>
              <h3 className="font-bold mb-3 font-sf-pro uppercase tracking-wider text-xs text-gray-500 dark:text-gray-400">Amenities</h3>
              <div className="space-y-2">
                {AMENITIES_LIST.map((amenity) => (
                  <label key={amenity} className="flex items-center gap-2.5 cursor-pointer group">
                    <input
                      type="checkbox"
                      checked={formData.amenities.includes(amenity)}
                      onChange={() => toggleAmenity(amenity)}
                      className="w-4 h-4 text-primary border-gray-300 dark:border-gray-600 rounded focus:ring-primary dark:bg-background-dark"
                    />
                    <span className="text-sm text-gray-700 dark:text-gray-300 font-sf-pro group-hover:text-nordic dark:group-hover:text-white transition-colors">
                      {amenity}
                    </span>
                  </label>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Floating Action Bar (Mobile) */}
      <div className="fixed bottom-0 left-0 right-0 p-4 bg-white dark:bg-[#152e2a] border-t border-gray-200 dark:border-primary/20 shadow-xl md:hidden z-40 flex gap-3">
        <button
          type="button"
          onClick={() => router.back()}
          className="flex-1 py-3 rounded-lg border border-gray-300 dark:border-primary/30 bg-white dark:bg-background-dark text-nordic dark:text-white font-medium font-sf-pro"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={loading}
          className="flex-1 py-3 rounded-lg bg-primary text-white font-medium font-sf-pro flex justify-center items-center gap-2 disabled:opacity-50"
        >
          {loading ? 'Saving...' : 'Save'}
        </button>
      </div>

      {/* Desktop Submit Area */}
      <div className="hidden md:flex xl:col-span-12 justify-end gap-3 mt-4">
        <button
          type="button"
          onClick={() => router.back()}
          className="px-5 py-2.5 rounded-lg border border-gray-300 dark:border-primary/30 bg-white dark:bg-background-dark text-nordic dark:text-white hover:bg-gray-50 dark:hover:bg-primary/10 transition-colors font-medium font-sf-pro text-sm"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={loading}
          className="px-5 py-2.5 rounded-lg bg-primary hover:bg-primary/90 text-white font-medium shadow-md hover:shadow-lg transition-all duration-200 flex items-center gap-2 font-sf-pro text-sm disabled:opacity-50"
        >
          {loading ? (
            <span className="material-icons text-sm animate-spin">refresh</span>
          ) : (
            <span className="material-icons text-sm">save</span>
          )}
          Save Property
        </button>
      </div>
    </form>
  );
}
