import React, { useState, useEffect } from 'react';
import { useAuth } from './hooks/useAuth';
import { useTheme } from './hooks/useTheme';
import { useStore } from './store';
import { Sidebar } from './components/layout/Sidebar';
import { Header } from './components/layout/Header';
import { Dashboard } from './components/dashboard/Dashboard';
import { ProductsPage } from './components/products/ProductsPage';
import { WarehousesPage } from './components/warehouses/WarehousesPage';
import { MovementsPage } from './components/movements/MovementsPage';
import { InventoryPage } from './components/inventory/InventoryPage';
import { SuppliersPage } from './components/suppliers/SuppliersPage';
import { CustomersPage } from './components/customers/CustomersPage';
import { AlertsPage } from './components/alerts/AlertsPage';
import { SettingsPage } from './components/settings/SettingsPage';
import { LoginPage } from './components/auth/LoginPage';
import { RegisterPage } from './components/auth/RegisterPage';
import { ProtectedRoute } from './components/auth/ProtectedRoute';
import { cn } from './lib/utils';
import { AnimatePresence, motion } from 'framer-motion';

type AuthView = 'login' | 'register';

const pageTransition = {
  initial: { opacity: 0, y: 12 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -8 },
  transition: { duration: 0.2, ease: [0.25, 0.1, 0.25, 1] as const },
};

const App: React.FC = () => {
  const { isAuthenticated, checkSession } = useAuth();
  const { theme } = useTheme();
  const { generateAlerts, sidebarOpen } = useStore();
  const [currentPage, setCurrentPage] = useState('dashboard');
  const [authView, setAuthView] = useState<AuthView>('login');

  // Initialize theme
  useEffect(() => {
    document.documentElement.classList.remove('dark', 'light');
    document.documentElement.classList.add(theme);
  }, [theme]);

  useEffect(() => { checkSession(); }, []);
  useEffect(() => { if (isAuthenticated) generateAlerts(); }, [isAuthenticated]);

  const titles: Record<string, string> = {
    dashboard: 'Tableau de Bord', products: 'Produits', warehouses: 'Entrepôts',
    movements: 'Mouvements', inventory: 'Inventaire', suppliers: 'Fournisseurs',
    customers: 'Clients', alerts: 'Alertes', settings: 'Paramètres',
  };

  const renderPage = () => {
    const pages: Record<string, React.ReactNode> = {
      dashboard: <Dashboard />,
      products: <ProductsPage />,
      warehouses: <ProtectedRoute allowedRoles={['admin', 'magasinier']}><WarehousesPage /></ProtectedRoute>,
      movements: <MovementsPage />,
      inventory: <InventoryPage />,
      suppliers: <ProtectedRoute allowedRoles={['admin', 'magasinier']}><SuppliersPage /></ProtectedRoute>,
      customers: <CustomersPage />,
      alerts: <AlertsPage />,
      settings: <ProtectedRoute allowedRoles={['admin']}><SettingsPage /></ProtectedRoute>,
    };
    return pages[currentPage] || <Dashboard />;
  };

  if (!isAuthenticated) {
    return authView === 'register'
      ? <RegisterPage onSwitchToLogin={() => setAuthView('login')} />
      : <LoginPage onSwitchToRegister={() => setAuthView('register')} />;
  }

  return (
    <div className="min-h-screen bg-[var(--bg-base)]">
      <Sidebar currentPage={currentPage} onNavigate={setCurrentPage} />
      <Header title={titles[currentPage] || 'ZION STOCK OS'} onNavigate={setCurrentPage} />

      <main className={cn(
        "pt-16 min-h-screen transition-all duration-300",
        sidebarOpen ? "lg:pl-60" : "lg:pl-[72px]",
        "max-lg:pl-0"
      )}>
        <div className="p-6 lg:p-8">
          <AnimatePresence mode="wait">
            <motion.div key={currentPage} {...pageTransition}>
              {renderPage()}
            </motion.div>
          </AnimatePresence>
        </div>
      </main>
    </div>
  );
};

export default App;
