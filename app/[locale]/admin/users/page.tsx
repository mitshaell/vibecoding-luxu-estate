import { createClient } from '../../../../lib/supabase/server';
import RoleEditor from './RoleEditor';


export default async function AdminUsersPage() {
  const supabase = await createClient();
  const { data: { session } } = await supabase.auth.getSession();
  const currentUserId = session?.user?.id;

  // Fetch real user roles from DB
  const { data: userRoles } = await supabase
    .from('user_roles')
    .select('user_id, role, created_at')
    .order('created_at', { ascending: false });

  const rows = userRoles ?? [];

  return (
    <div className="min-h-full bg-background-light dark:bg-background-dark font-display flex flex-col antialiased">
      <header className="w-full pt-8 pb-6 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-nordic dark:text-white">
              User Directory
            </h1>
            <p className="text-nordic/60 dark:text-gray-400 mt-1 text-sm">
              Manage user access and roles for your properties.
            </p>
          </div>
          <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
            {/* Search */}
            <div className="relative group w-full md:w-80">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <span className="material-icons text-nordic/40 group-focus-within:text-primary text-xl">search</span>
              </div>
              <input
                type="text"
                placeholder="Search by name, email..."
                className="block w-full pl-10 pr-3 py-2.5 border-none rounded-lg bg-white dark:bg-gray-800 text-nordic dark:text-white shadow-soft placeholder-nordic/30 focus:ring-2 focus:ring-primary focus:bg-white transition-all text-sm"
              />
            </div>
            {/* Add User */}
            <button className="inline-flex items-center justify-center px-4 py-2.5 border border-primary text-sm font-medium rounded-lg text-primary bg-transparent hover:bg-primary/5 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary transition-colors whitespace-nowrap">
              <span className="material-icons text-lg mr-2">add</span>
              Add User
            </button>
          </div>
        </div>

        {/* Tabs */}
        <div className="mt-8 flex gap-6 border-b border-nordic/10 overflow-x-auto">
          {['All Users', 'Agents', 'Brokers', 'Admins'].map((tab, i) => (
            <button
              key={tab}
              className={
                i === 0
                  ? "pb-3 text-sm font-semibold text-primary border-b-2 border-primary whitespace-nowrap"
                  : "pb-3 text-sm font-medium text-nordic/60 hover:text-nordic transition-colors whitespace-nowrap"
              }
            >
              {tab}
            </button>
          ))}
        </div>
      </header>

      {/* ── Content ────────────────────────────────────────────────────── */}
      <main className="flex-grow px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full pb-12 space-y-4">
        {/* Column headers (desktop only) */}
        <div className="hidden md:grid grid-cols-12 gap-4 px-6 text-xs font-semibold uppercase tracking-wider text-nordic/50 mb-2">
          <div className="col-span-4">User Details</div>
          <div className="col-span-3">Role &amp; Status</div>
          <div className="col-span-3">Performance</div>
          <div className="col-span-2 text-right">Actions</div>
        </div>

        {/* ── Real DB user rows ───────────────────────────────────────── */}
        {rows.length > 0 && (
          <div className="mb-8">
            <h2 className="text-xs font-semibold uppercase tracking-wider mb-4 text-nordic/50">
              Database Users ({rows.length})
            </h2>
            <div className="space-y-4">
              {rows.map((row) => {
                const isSelf = row.user_id === currentUserId;
                const shortId = row.user_id.split('-')[0];
                const createdDate = new Date(row.created_at).toLocaleDateString('es-ES', {
                  day: '2-digit', month: 'short', year: 'numeric',
                });
                const isAdmin = row.role === 'admin';

                return (
                  <div
                    key={row.user_id}
                    className={`user-card group relative rounded-xl p-5 shadow-sm flex flex-col md:grid md:grid-cols-12 gap-4 items-center z-10 transition-all ${
                      isSelf 
                        ? 'bg-active-green dark:bg-primary/20 border border-transparent hover:shadow-soft' 
                        : 'bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 hover:bg-active-green dark:hover:bg-primary/20'
                    }`}
                  >
                    {/* User Details */}
                    <div className="col-span-12 md:col-span-4 flex items-center w-full">
                      <div className="relative flex-shrink-0">
                        <div
                          className={`h-12 w-12 rounded-full flex items-center justify-center text-sm font-bold text-white ${
                            isAdmin ? 'bg-[#8B5CF6]' : 'bg-primary'
                          } ${isSelf ? 'border-2 border-white dark:border-primary' : ''}`}
                        >
                          {shortId.charAt(0).toUpperCase()}
                        </div>
                        {isSelf && (
                          <span className="absolute bottom-0 right-0 block h-3 w-3 rounded-full bg-green-400 ring-2 ring-white" />
                        )}
                      </div>
                      <div className="ml-4 overflow-hidden">
                        <div className={`text-sm font-bold truncate ${isSelf ? 'text-nordic dark:text-white' : 'text-nordic dark:text-white'}`}>
                          {isSelf ? 'You (Admin)' : `User ${shortId}`}
                        </div>
                        <div className={`text-xs truncate ${isSelf ? 'text-nordic/70 dark:text-gray-300' : 'text-nordic/60 dark:text-gray-400'}`}>
                          Joined {createdDate}
                        </div>
                        <div className={`mt-1 text-[10px] px-2 py-0.5 inline-block rounded transition-colors ${
                          isSelf 
                            ? 'bg-white/50 text-nordic/60' 
                            : 'bg-gray-50 dark:bg-white/10 text-nordic/50 dark:text-gray-400 group-hover:bg-white/50'
                        }`}>
                          ID: #{row.user_id.slice(0, 8)}…
                        </div>
                      </div>
                    </div>

                    {/* Role & Status */}
                    <div className="col-span-12 md:col-span-3 w-full flex items-center justify-between md:justify-start gap-4">
                      <span
                        className={`inline-flex items-center px-2.5 py-1 rounded-md text-xs font-medium ${
                          isAdmin
                            ? 'bg-nordic text-white'
                            : 'bg-primary/10 text-primary'
                        }`}
                      >
                        {row.role === 'admin' ? 'Administrator' : row.role}
                      </span>
                      <div className="flex items-center text-xs text-nordic/60 dark:text-gray-400">
                        <span className="material-icons text-[14px] mr-1 text-primary">check_circle</span>
                        Active
                      </div>
                    </div>

                    {/* Performance */}
                    <div className="col-span-12 md:col-span-3 w-full grid grid-cols-2 gap-4">
                      <div>
                        <div className="text-[10px] uppercase tracking-wider text-nordic/40">Role</div>
                        <div className="text-sm font-semibold text-nordic dark:text-white">{row.role}</div>
                      </div>
                      <div>
                        <div className="text-[10px] uppercase tracking-wider text-nordic/40">Joined</div>
                        <div className="text-sm font-semibold text-nordic dark:text-white">{createdDate}</div>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="col-span-12 md:col-span-2 w-full flex justify-end relative">
                      <RoleEditor
                        userId={row.user_id}
                        currentRole={row.role}
                        isSelf={isSelf}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}


      </main>

      {/* ── Pagination Footer ───────────────────────────────────────────── */}
      <footer className="mt-auto border-t border-nordic/5 bg-background-light dark:bg-background-dark py-6 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
            <div>
              <p className="text-sm text-nordic/60 dark:text-gray-400">
                Showing <span className="font-medium text-nordic dark:text-white">1</span> to{' '}
                <span className="font-medium text-nordic dark:text-white">{rows.length}</span> of{' '}
                <span className="font-medium text-nordic dark:text-white">{rows.length}</span> users
              </p>
            </div>
            <div>
              <nav aria-label="Pagination" className="relative z-0 inline-flex rounded-md shadow-none -space-x-px">
                <a href="#" className="relative inline-flex items-center px-2 py-2 rounded-l-md text-sm font-medium text-nordic/50 hover:text-primary transition-colors">
                  <span className="sr-only">Previous</span>
                  <span className="material-icons text-xl">chevron_left</span>
                </a>
                <a href="#" aria-current="page" className="z-10 bg-primary text-white relative inline-flex items-center px-4 py-2 text-sm font-medium rounded-md mx-1 shadow-sm">
                  1
                </a>
                <a href="#" className="bg-transparent text-nordic/70 hover:bg-white hover:text-primary relative inline-flex items-center px-4 py-2 text-sm font-medium rounded-md mx-1 transition-colors">
                  2
                </a>
                <a href="#" className="bg-transparent text-nordic/70 hover:bg-white hover:text-primary relative inline-flex items-center px-4 py-2 text-sm font-medium rounded-md mx-1 transition-colors">
                  3
                </a>
                <span className="relative inline-flex items-center px-4 py-2 text-sm font-medium text-nordic/40">
                  ...
                </span>
                <a href="#" className="bg-transparent text-nordic/70 hover:bg-white hover:text-primary relative inline-flex items-center px-4 py-2 text-sm font-medium rounded-md mx-1 transition-colors">
                  8
                </a>
                <a href="#" className="relative inline-flex items-center px-2 py-2 rounded-r-md text-sm font-medium text-nordic/50 hover:text-primary transition-colors">
                  <span className="sr-only">Next</span>
                  <span className="material-icons text-xl">chevron_right</span>
                </a>
              </nav>
            </div>
          </div>
          <div className="flex items-center justify-between w-full sm:hidden">
            <a href="#" className="relative inline-flex items-center px-4 py-2 text-sm font-medium rounded-md text-nordic bg-white border border-gray-300 hover:bg-gray-50">
              Previous
            </a>
            <a href="#" className="ml-3 relative inline-flex items-center px-4 py-2 text-sm font-medium rounded-md text-nordic bg-white border border-gray-300 hover:bg-gray-50">
              Next
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
}
