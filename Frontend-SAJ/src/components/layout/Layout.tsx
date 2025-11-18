import type { ReactNode } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import {
  LayoutDashboard,
  UserCheck,
  Scale,
  CalendarClock,
  LogOut,
  Gavel,
} from 'lucide-react';
import { cn } from '../../lib/utils';

interface LayoutProps {
  children: ReactNode;
}

const navigation = [
  { name: 'Dashboard', href: '/', icon: LayoutDashboard },
  { name: 'Clientes', href: '/clients', icon: UserCheck },
  { name: 'Processos', href: '/processes', icon: Scale },
  { name: 'Agendamentos', href: '/appointments', icon: CalendarClock },
];

export function Layout({ children }: LayoutProps) {
  const { logout, fullName, username } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  return (
    <div className="flex h-screen bg-background">
      {/* Sidebar Premium */}
      <aside className="w-64 gradient-navy flex flex-col shadow-xl">
        {/* Logo */}
        <div className="flex h-20 items-center gap-3 border-b border-white/10 px-6">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-white/10 backdrop-blur-sm">
            <Gavel className="h-6 w-6 text-[hsl(43,74%,49%)]" />
          </div>
          <div>
            <h1 className="text-base font-bold text-white tracking-wide">SAJ</h1>
            <p className="text-xs text-white/60 font-medium">Sistema Jurídico</p>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 space-y-1 p-4">
          {navigation.map((item) => (
            <NavLink
              key={item.name}
              to={item.href}
              end={item.href === '/'}
              className={({ isActive }) =>
                cn(
                  'flex items-center gap-3 rounded-lg px-4 py-3 text-sm font-medium transition-all duration-300',
                  isActive
                    ? 'bg-white/15 text-white shadow-sm'
                    : 'text-white/70 hover:bg-white/10 hover:text-white'
                )
              }
            >
              {({ isActive }) => (
                <>
                  <item.icon className={cn(
                    'h-5 w-5 transition-colors duration-300',
                    isActive ? 'text-[hsl(43,74%,49%)]' : 'text-white/70'
                  )} />
                  {item.name}
                </>
              )}
            </NavLink>
          ))}
        </nav>

        {/* User Info & Logout */}
        <div className="border-t border-white/10 p-4">
          {fullName && (
            <div className="mb-3 px-4 py-2">
              <p className="text-xs text-white/50 font-medium">Logado como</p>
              <p className="text-sm text-white font-medium truncate">{fullName || username}</p>
            </div>
          )}
          <button
            onClick={handleLogout}
            className="flex w-full items-center gap-3 rounded-lg px-4 py-3 text-sm font-medium text-white/70 transition-all duration-300 hover:bg-red-500/20 hover:text-red-300"
          >
            <LogOut className="h-5 w-5" />
            Sair
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-auto">
        {/* Header Premium */}
        <header className="h-20 border-b border-slate-200 bg-white px-8 shadow-sm">
          <div className="flex h-full items-center justify-between">
            <div>
              <h2 className="text-xl font-semibold text-slate-900">
                Sistema de Agendamento Jurídico
              </h2>
              <p className="text-sm text-slate-500">
                Gerencie seus processos e agendamentos com eficiência
              </p>
            </div>
            <div className="flex items-center gap-2">
              <div className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse"></div>
              <span className="text-xs text-slate-500 font-medium">Online</span>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <div className="min-h-[calc(100vh-5rem)] p-8">{children}</div>
      </main>
    </div>
  );
}
