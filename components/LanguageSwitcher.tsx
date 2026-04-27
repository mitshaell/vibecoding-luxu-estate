"use client";

import { usePathname, useRouter } from "next/navigation";
import { useState, useRef, useEffect } from "react";
import { locales } from "../lib/i18n";

export default function LanguageSwitcher({ currentLocale }: { currentLocale: string }) {
  const router = useRouter();
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const handleLanguageChange = (newLocale: string) => {
    // pathname always starts with /locale if middleware is working
    if (!pathname) return;
    
    // Replace the current locale in the path with the new locale
    const segments = pathname.split("/");
    segments[1] = newLocale;
    const newPath = segments.join("/");
    
    // Create cookie (optional, middleware does this too)
    document.cookie = `NEXT_LOCALE=${newLocale}; path=/; max-age=31536000`;
    
    setIsOpen(false);
    router.push(newPath);
    router.refresh();
  };

  const languageInfo: Record<string, { name: string, flag: string }> = {
    es: { name: "ES", flag: "https://flagcdn.com/es.svg" },
    en: { name: "EN", flag: "https://flagcdn.com/us.svg" },
    fr: { name: "FR", flag: "https://flagcdn.com/fr.svg" }
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className="relative inline-block text-left" ref={dropdownRef}>
      <button
        type="button"
        className="flex items-center gap-1 text-nordic-dark hover:text-mosque font-medium text-sm transition-colors border border-nordic-dark/10 rounded-md px-2 py-1 bg-white shadow-sm"
        onClick={() => setIsOpen(!isOpen)}
      >
        <span className="material-icons text-[18px]">language</span>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={languageInfo[currentLocale].flag} alt={currentLocale} className="w-4 h-3 object-cover rounded-sm border border-nordic-dark/10" />
        {languageInfo[currentLocale].name}
      </button>

      {isOpen && (
        <div className="origin-top-right absolute right-0 mt-2 w-24 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 z-50">
          <div className="py-1" role="menu" aria-orientation="vertical">
            {locales.map((loc) => (
              <button
                key={loc}
                className={`w-full text-left px-4 py-2 text-sm transition-colors ${
                  currentLocale === loc
                    ? "bg-mosque/10 text-mosque font-semibold"
                    : "text-nordic-dark hover:bg-black/5"
                }`}
                role="menuitem"
                onClick={() => handleLanguageChange(loc)}
              >
                <div className="flex items-center gap-2">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={languageInfo[loc].flag} alt={loc} className="w-4 h-3 object-cover rounded-sm border border-nordic-dark/10" />
                  {languageInfo[loc].name}
                </div>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
