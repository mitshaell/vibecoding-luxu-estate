'use client';

import { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { createClient } from '../../../../lib/supabase/client';

interface AdminUserProfileProps {
  avatarUrl: string | null;
  displayName: string;
  locale: string;
}

export default function AdminUserProfile({ avatarUrl, displayName, locale }: AdminUserProfileProps) {
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const router = useRouter();
  const supabase = createClient();

  const defaultAvatar = `https://ui-avatars.com/api/?name=${encodeURIComponent(displayName?.charAt(0) ?? 'A')}&background=006655&color=fff`;

  // Close menu when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    router.push(`/${locale}`);
    router.refresh();
  };

  return (
    <div className="px-4 py-4 border-t border-white/10 relative" ref={menuRef}>
      {/* Dropdown Menu */}
      {isOpen && (
        <div className="absolute bottom-full left-4 right-4 mb-2 bg-white rounded-lg shadow-lg overflow-hidden py-1 z-50 animate-in fade-in slide-in-from-bottom-2 duration-200">
          <Link
            href={`/${locale}`}
            className="flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
          >
            <span className="material-icons text-sm text-gray-400">arrow_back</span>
            Volver al sitio
          </Link>
          <button
            onClick={handleSignOut}
            className="w-full flex items-center gap-2 px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors text-left"
          >
            <span className="material-icons text-sm">logout</span>
            Cerrar sesión
          </button>
        </div>
      )}

      {/* User Profile Button */}
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center gap-3 p-2 -m-2 rounded-lg hover:bg-white/5 transition-colors text-left focus:outline-none"
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={avatarUrl || defaultAvatar}
          alt="Avatar"
          className="w-8 h-8 rounded-full object-cover ring-2 ring-white/20 flex-shrink-0"
        />
        <div className="flex-1 min-w-0">
          <p className="text-white text-xs font-medium truncate">{displayName}</p>
          <p className="text-white/40 text-[10px] uppercase tracking-wider mt-0.5">Administrador</p>
        </div>
        <span className={`material-icons text-white/40 text-sm transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`}>
          expand_less
        </span>
      </button>
    </div>
  );
}
