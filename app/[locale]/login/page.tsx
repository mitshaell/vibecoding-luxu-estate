import LoginForm from './LoginForm';
import { getDictionary, Locale } from '../../../lib/i18n';

interface LoginPageProps {
  params: Promise<{ locale: string }>;
}

export default async function LoginPage({ params }: LoginPageProps) {
  const { locale } = await params;
  const dict = await getDictionary(locale as Locale);
  const t = dict.navbar;

  return (
    <div
      className="min-h-screen flex flex-col items-center justify-center p-4 antialiased relative overflow-hidden"
      style={{ backgroundColor: '#EEF6F6' }}
    >
      {/* Subtle background blobs */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute -top-32 -right-32 w-[500px] h-[500px] rounded-full blur-3xl" style={{ backgroundColor: 'rgba(217,236,200,0.35)' }} />
        <div className="absolute -bottom-32 -left-32 w-96 h-96 rounded-full blur-3xl" style={{ backgroundColor: 'rgba(0,102,85,0.07)' }} />
      </div>

      <main className="w-full max-w-md z-10">
        {/* Header */}
        <div className="text-center mb-10">
          <div
            className="inline-flex items-center justify-center w-14 h-14 rounded-xl mb-6 text-white"
            style={{ backgroundColor: '#19322F', boxShadow: '0 4px 20px -2px rgba(25,50,47,0.18)' }}
          >
            <span className="material-symbols-outlined text-3xl">real_estate_agent</span>
          </div>
          <h1 className="text-3xl font-bold tracking-tight mb-2" style={{ color: '#19322F' }}>
            Welcome to LuxeEstate
          </h1>
          <p style={{ color: '#5C706D' }}>Unlock exclusive properties worldwide.</p>
        </div>

        {/* Card */}
        <div
          className="rounded-2xl p-8 sm:p-10"
          style={{
            backgroundColor: '#FFFFFF',
            border: '1px solid rgba(217,236,200,0.6)',
            boxShadow: '0 4px 32px -4px rgba(25,50,47,0.08)',
          }}
        >
          <LoginForm />

          <p className="mt-8 text-center text-sm" style={{ color: 'rgba(25,50,47,0.6)' }}>
            Don&apos;t have an account?{' '}
            <a
              className="font-semibold login-signup-link transition-colors"
              href="#"
            >
              Sign up
            </a>
          </p>

          <style>{`
            .login-signup-link { color: #006655; }
            .login-signup-link:hover { color: #004d40; }
          `}</style>
        </div>

        {/* Footer links */}
        <div className="mt-8 text-center">
          <nav className="flex justify-center gap-6 text-xs" style={{ color: 'rgba(25,50,47,0.45)' }}>
            {(['Privacy Policy', 'Terms of Service', 'Help Center'] as const).map(label => (
              <a
                key={label}
                href="#"
                className="hover:underline transition-colors"
              >
                {label}
              </a>
            ))}
          </nav>
        </div>
      </main>
    </div>
  );
}
