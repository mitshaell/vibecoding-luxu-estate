import Link from "next/link";
import LanguageSwitcher from "./LanguageSwitcher";
import UserMenu from "./UserMenu";
import { createClient } from '../lib/supabase/server';

export default async function Navbar({ dict, locale }: { dict?: any; locale?: string }) {
  const supabase = await createClient();
  const { data: { session } } = await supabase.auth.getSession();
  const user = session?.user;
  const avatarUrl = user?.user_metadata?.avatar_url ?? null;

  // Use fallbacks in case dict is missing
  const navDict = dict?.navbar || {
    buy: "Buy", rent: "Rent", sell: "Sell", savedHomes: "Saved Homes",
    login: "Sign in", logout: "Sign out", profile: "My profile",
  };
  const currentLocale = locale || "es";

  return (
    <nav className="sticky top-0 z-50 bg-background-light/95 backdrop-blur-md border-b border-nordic-dark/10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-20">
          <Link href={`/${currentLocale}`} className="flex-shrink-0 flex items-center gap-2 cursor-pointer">
            <div className="w-8 h-8 rounded-lg bg-nordic-dark flex items-center justify-center">
              <span className="material-icons text-white text-lg">apartment</span>
            </div>
            <span className="text-xl font-semibold tracking-tight text-nordic-dark">LuxeEstate</span>
          </Link>
          <div className="hidden md:flex items-center space-x-8">
            <a className="text-mosque font-medium text-sm border-b-2 border-mosque px-1 py-1" href="#">{navDict.buy}</a>
            <a className="text-nordic-dark/70 hover:text-nordic-dark font-medium text-sm hover:border-b-2 hover:border-nordic-dark/20 px-1 py-1 transition-all" href="#">{navDict.rent}</a>
            <a className="text-nordic-dark/70 hover:text-nordic-dark font-medium text-sm hover:border-b-2 hover:border-nordic-dark/20 px-1 py-1 transition-all" href="#">{navDict.sell}</a>
            <a className="text-nordic-dark/70 hover:text-nordic-dark font-medium text-sm hover:border-b-2 hover:border-nordic-dark/20 px-1 py-1 transition-all" href="#">{navDict.savedHomes}</a>
          </div>
          <div className="flex items-center space-x-6">
            <LanguageSwitcher currentLocale={currentLocale} />
            <button className="text-nordic-dark hover:text-mosque transition-colors">
              <span className="material-icons">search</span>
            </button>
            <button className="text-nordic-dark hover:text-mosque transition-colors relative">
              <span className="material-icons">notifications_none</span>
              <span className="absolute top-0 right-0 w-2 h-2 bg-red-500 rounded-full border-2 border-background-light"></span>
            </button>

            {user ? (
              <UserMenu
                avatarUrl={avatarUrl}
                email={user.email ?? null}
                logoutLabel={navDict.logout}
                profileLabel={navDict.profile}
                locale={currentLocale}
              />
            ) : (
              <div className="pl-2 border-l border-nordic-dark/10 ml-2 flex items-center">
                <Link
                  href={`/${currentLocale}/login`}
                  className="px-4 py-2 rounded-lg text-sm font-medium bg-mosque text-white hover:bg-mosque/90 transition-colors"
                >
                  {navDict.login}
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
      <div className="md:hidden border-t border-nordic-dark/5 bg-background-light overflow-hidden h-0 transition-all duration-300">
        <div className="px-4 py-2 space-y-1">
          <a className="block px-3 py-2 rounded-md text-base font-medium text-mosque bg-mosque/10" href="#">{navDict.buy}</a>
          <a className="block px-3 py-2 rounded-md text-base font-medium text-nordic-dark hover:bg-black/5" href="#">{navDict.rent}</a>
          <a className="block px-3 py-2 rounded-md text-base font-medium text-nordic-dark hover:bg-black/5" href="#">{navDict.sell}</a>
          <a className="block px-3 py-2 rounded-md text-base font-medium text-nordic-dark hover:bg-black/5" href="#">{navDict.savedHomes}</a>
        </div>
      </div>
    </nav>
  );
}
