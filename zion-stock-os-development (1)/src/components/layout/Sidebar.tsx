import React from 'react';
import { LayoutDashboard, Package, Warehouse, ArrowDownUp, Users, Truck, AlertTriangle, Settings, LogOut, ChevronLeft, ChevronRight, FileText } from 'lucide-react';
import { cn } from '../../lib/utils';
import { useStore } from '../../store';
import { useAuth } from '../../hooks/useAuth';
import { motion, AnimatePresence } from 'framer-motion';

interface SidebarProps { currentPage: string; onNavigate: (page: string) => void; }

const menuItems = [
  { id: 'dashboard', label: 'Tableau de Bord', icon: LayoutDashboard },
  { id: 'products', label: 'Produits', icon: Package },
  { id: 'warehouses', label: 'Entrepôts', icon: Warehouse },
  { id: 'movements', label: 'Mouvements', icon: ArrowDownUp },
  { id: 'inventory', label: 'Inventaire', icon: FileText },
  { id: 'suppliers', label: 'Fournisseurs', icon: Truck },
  { id: 'customers', label: 'Clients', icon: Users },
  { id: 'alerts', label: 'Alertes', icon: AlertTriangle },
];

export const Sidebar: React.FC<SidebarProps> = ({ currentPage, onNavigate }) => {
  const { sidebarOpen, toggleSidebar, alerts } = useStore();
  const { user, logout } = useAuth();
  const unreadAlerts = alerts.filter(a => !a.isRead).length;

  return (
    <>
      {/* Mobile overlay */}
      <AnimatePresence>
        {sidebarOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm lg:hidden"
            onClick={toggleSidebar}
          />
        )}
      </AnimatePresence>

      <aside
        className={cn(
          "fixed left-0 top-0 z-50 h-screen bg-[var(--bg-surface)] border-r border-[var(--border)] flex flex-col transition-all duration-300 ease-in-out",
          sidebarOpen ? "w-60" : "w-[72px]",
          "max-lg:translate-x-0",
          !sidebarOpen && "max-lg:-translate-x-full"
        )}
      >
        {/* Logo */}
        <div className="flex items-center h-16 px-4 border-b border-[var(--border)]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-[var(--accent)] rounded-xl flex items-center justify-center font-extrabold text-[var(--text-inverse)] text-lg shrink-0 shadow-lg shadow-[var(--accent)]/20">
              Z
            </div>
            <AnimatePresence>
              {sidebarOpen && (
                <motion.div
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -10 }}
                  transition={{ duration: 0.15 }}
                >
                  <p className="font-bold text-sm tracking-tight">ZION STOCK</p>
                  <p className="text-[10px] text-[var(--text-muted)] font-medium">OS v1.1</p>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* Nav */}
        <nav className="flex-1 py-4 overflow-y-auto px-3">
          <ul className="space-y-1">
            {menuItems.map((item) => {
              const Icon = item.icon;
              const isActive = currentPage === item.id;
              const hasNotification = item.id === 'alerts' && unreadAlerts > 0;
              return (
                <li key={item.id}>
                  <button
                    onClick={() => onNavigate(item.id)}
                    className={cn(
                      "w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-150 group relative",
                      isActive
                        ? "bg-[var(--primary-muted)] text-[var(--primary)]"
                        : "text-[var(--text-secondary)] hover:bg-[var(--bg-hover)] hover:text-[var(--text-primary)]",
                      !sidebarOpen && "justify-center px-0"
                    )}
                  >
                    {isActive && (
                      <motion.div
                        layoutId="activeTab"
                        className="absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-6 bg-[var(--primary)] rounded-r-full"
                        transition={{ type: 'spring', stiffness: 350, damping: 30 }}
                      />
                    )}
                    <div className="relative shrink-0">
                      <Icon className={cn("w-5 h-5", isActive && "text-[var(--primary)]")} />
                      {hasNotification && (
                        <span className="absolute -top-1 -right-1 w-4 h-4 bg-[var(--danger)] text-white text-[10px] rounded-full flex items-center justify-center font-bold">
                          {unreadAlerts > 9 ? '!' : unreadAlerts}
                        </span>
                      )}
                    </div>
                    {sidebarOpen && (
                      <span className={cn("text-sm font-medium truncate", isActive && "font-semibold")}>{item.label}</span>
                    )}
                  </button>
                </li>
              );
            })}
          </ul>
        </nav>

        {/* Footer */}
        <div className="border-t border-[var(--border)] p-3 space-y-2">
          {/* Settings */}
          <button
            onClick={() => onNavigate('settings')}
            className={cn(
              "w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-[var(--text-secondary)] hover:bg-[var(--bg-hover)] hover:text-[var(--text-primary)] transition-all",
              currentPage === 'settings' && "bg-[var(--primary-muted)] text-[var(--primary)]",
              !sidebarOpen && "justify-center px-0"
            )}
          >
            <Settings className="w-5 h-5 shrink-0" />
            {sidebarOpen && <span className="text-sm font-medium">Paramètres</span>}
          </button>

          {/* User */}
          {user && sidebarOpen && (
            <div className="flex items-center gap-3 px-3 py-2 rounded-xl bg-[var(--bg-base)]">
              <div className="w-8 h-8 bg-[var(--accent)] rounded-lg flex items-center justify-center font-bold text-[var(--text-inverse)] text-xs shrink-0">
                {user.name.charAt(0)}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-semibold truncate">{user.name}</p>
                <p className="text-[10px] text-[var(--text-muted)] capitalize">{user.role}</p>
              </div>
              <button onClick={logout} className="p-1.5 rounded-lg hover:bg-[var(--bg-hover)] text-[var(--text-muted)] hover:text-[var(--danger)] transition-colors">
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          )}

          {/* Collapse toggle */}
          <button
            onClick={toggleSidebar}
            className="hidden lg:flex w-full items-center justify-center gap-2 py-2 text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors"
          >
            {sidebarOpen ? <ChevronLeft className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
          </button>
        </div>
      </aside>
    </>
  );
};
