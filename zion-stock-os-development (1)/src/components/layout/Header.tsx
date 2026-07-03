import React from 'react';
import { Bell, Search, Menu, Sun, Moon } from 'lucide-react';
import { useStore } from '../../store';
import { useTheme } from '../../hooks/useTheme';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Badge } from '../ui/badge';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from '../ui/dropdown-menu';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { cn } from '../../lib/utils';

interface HeaderProps { title: string; onNavigate: (page: string) => void; }

export const Header: React.FC<HeaderProps> = ({ title, onNavigate }) => {
  const { alerts, warehouses, selectedWarehouseId, setSelectedWarehouse, markAlertRead, sidebarOpen, toggleSidebar } = useStore();
  const { theme, toggleTheme } = useTheme();
  const unreadAlerts = alerts.filter(a => !a.isRead);

  return (
    <header className={cn(
      "fixed top-0 right-0 z-30 h-16 bg-[var(--bg-base)]/80 backdrop-blur-xl border-b border-[var(--border)] flex items-center justify-between px-6 lg:px-8 transition-all duration-300",
      sidebarOpen ? "left-60" : "left-[72px]",
      "max-lg:left-0"
    )}>
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={toggleSidebar} className="lg:hidden">
          <Menu className="w-5 h-5" />
        </Button>
        <h2 className="text-lg font-bold text-[var(--text-primary)]">{title}</h2>
      </div>

      <div className="flex items-center gap-3">
        {/* Warehouse filter */}
        <Select value={selectedWarehouseId || 'all'} onValueChange={(v) => setSelectedWarehouse(v === 'all' ? null : v)}>
          <SelectTrigger className="w-[180px] hidden md:flex h-9 text-xs">
            <SelectValue placeholder="Tous les entrepôts" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Tous les entrepôts</SelectItem>
            {warehouses.map((wh) => (<SelectItem key={wh.id} value={wh.id}>{wh.name}</SelectItem>))}
          </SelectContent>
        </Select>

        {/* Search */}
        <div className="relative hidden lg:block">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--text-muted)]" />
          <Input placeholder="Rechercher..." className="pl-10 w-56 h-9 text-xs rounded-lg" />
        </div>

        {/* Theme toggle */}
        <Button variant="ghost" size="icon" onClick={toggleTheme} className="h-9 w-9">
          {theme === 'dark' ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
        </Button>

        {/* Notifications */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="relative h-9 w-9">
              <Bell className="w-4 h-4" />
              {unreadAlerts.length > 0 && (
                <span className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-[var(--danger)] text-white text-[10px] rounded-full flex items-center justify-center font-bold">
                  {unreadAlerts.length > 9 ? '!' : unreadAlerts.length}
                </span>
              )}
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-80">
            <DropdownMenuLabel className="flex items-center justify-between">
              <span>Notifications</span>
              {unreadAlerts.length > 0 && <Badge variant="destructive">{unreadAlerts.length}</Badge>}
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            {unreadAlerts.length === 0 ? (
              <div className="p-4 text-center text-[var(--text-muted)] text-sm">Aucune notification</div>
            ) : (
              <>
                {unreadAlerts.slice(0, 5).map((alert) => (
                  <DropdownMenuItem key={alert.id} onClick={() => markAlertRead(alert.id)} className="flex items-start gap-3 p-3 cursor-pointer">
                    <div className={cn("w-2 h-2 rounded-full mt-2 shrink-0", alert.type === 'OUT_OF_STOCK' ? 'bg-[var(--danger)]' : 'bg-[var(--warning)]')} />
                    <div className="flex-1 min-w-0"><p className="text-sm leading-tight">{alert.message}</p></div>
                  </DropdownMenuItem>
                ))}
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => onNavigate('alerts')} className="text-center text-[var(--primary)] font-medium justify-center text-sm">
                  Voir toutes les alertes
                </DropdownMenuItem>
              </>
            )}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
};
