import LoginForm from './LoginForm';

export default function LoginPage() {
  return (
    <main className="w-full max-w-md z-10 mx-auto mt-20 relative">
      <div className="absolute inset-0 pointer-events-none opacity-40 -z-10">
        <div className="absolute -top-24 -right-24 w-96 h-96 bg-hint-of-green/30 rounded-full blur-3xl dark:bg-mosque/10"></div>
        <div className="absolute -bottom-24 -left-24 w-80 h-80 bg-mosque/10 rounded-full blur-3xl"></div>
      </div>
      
      <div className="text-center mb-10">
        <div className="inline-flex items-center justify-center w-14 h-14 bg-mosque rounded-xl mb-6 shadow-soft text-white">
          <span className="material-symbols-outlined text-3xl">real_estate_agent</span>
        </div>
        <h1 className="text-3xl font-bold tracking-tight text-nordic-dark dark:text-white mb-2">Welcome to LuxeEstate</h1>
        <p className="text-nordic-muted dark:text-gray-400">Unlock exclusive properties worldwide.</p>
      </div>
      
      <div className="bg-surface dark:bg-[#152e2a] rounded-2xl shadow-soft p-8 sm:p-10 border border-white/50 dark:border-mosque/20 backdrop-blur-sm relative z-20">
        <LoginForm />
        
        <p className="mt-8 text-center text-sm text-nordic-dark/70 dark:text-gray-400">
          Don't have an account?{' '}
          <a className="font-semibold text-mosque hover:text-mosque/80 transition-colors" href="#">Sign up</a>
        </p>
      </div>
      
      <div className="mt-8 text-center relative z-20">
        <nav className="flex justify-center gap-6 text-xs text-nordic-dark/50 dark:text-gray-500">
          <a className="hover:text-nordic-dark dark:hover:text-gray-300 transition-colors" href="#">Privacy Policy</a>
          <a className="hover:text-nordic-dark dark:hover:text-gray-300 transition-colors" href="#">Terms of Service</a>
          <a className="hover:text-nordic-dark dark:hover:text-gray-300 transition-colors" href="#">Help Center</a>
        </nav>
      </div>
    </main>
  );
}
