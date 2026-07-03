import React, { useEffect, useMemo } from 'react';
import { AlertTriangle, Bell, CheckCircle, XCircle, Package, RefreshCw } from 'lucide-react';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../ui/card';
import { StatCard } from '../ui/stat-card';
import { useStore } from '../../store';
import { formatDateTime } from '../../lib/utils';
import { motion } from 'framer-motion';

export const AlertsPage: React.FC = () => {
  const { alerts, products, warehouses, generateAlerts, markAlertRead, clearAlerts } = useStore();
  useEffect(() => { generateAlerts(); }, []);

  const sorted = useMemo(() => [...alerts].sort((a, b) => { if (a.isRead !== b.isRead) return a.isRead ? 1 : -1; return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(); }), [alerts]);
  const stats = useMemo(() => ({ out: alerts.filter(a => a.type === 'OUT_OF_STOCK').length, low: alerts.filter(a => a.type === 'LOW_STOCK').length, unread: alerts.filter(a => !a.isRead).length, total: alerts.length }), [alerts]);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div><h3 className="text-lg font-bold">Centre d'Alertes</h3><p className="text-sm text-[var(--text-muted)]">Surveillance des niveaux de stock</p></div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={generateAlerts}><RefreshCw className="w-4 h-4 mr-2" />Actualiser</Button>
          {stats.total > 0 && <Button variant="ghost" onClick={clearAlerts}>Effacer tout</Button>}
        </div>
      </div>

      <motion.div className="grid grid-cols-1 md:grid-cols-4 gap-4" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
        <StatCard title="Total Alertes" value={stats.total} icon={Bell} accent="primary" />
        <StatCard title="Non lues" value={stats.unread} icon={AlertTriangle} accent="warning" />
        <StatCard title="Ruptures" value={stats.out} icon={XCircle} accent="danger" />
        <StatCard title="Stock Bas" value={stats.low} icon={AlertTriangle} accent="warning" />
      </motion.div>

      <Card>
        <CardHeader><CardTitle>Toutes les Alertes</CardTitle><CardDescription>Cliquez pour marquer comme lue</CardDescription></CardHeader>
        <CardContent>
          {sorted.length === 0 ? (
            <div className="text-center py-16"><CheckCircle className="w-16 h-16 mx-auto mb-4 text-[var(--success)]" /><h3 className="text-lg font-bold">Tout est en ordre !</h3><p className="text-[var(--text-muted)] mt-1">Aucune alerte de stock</p></div>
          ) : (
            <div className="space-y-2">
              {sorted.map(alert => {
                const prod = products.find(p => p.id === alert.productId);
                const wh = warehouses.find(w => w.id === alert.warehouseId);
                return (
                  <motion.div key={alert.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                    onClick={() => !alert.isRead && markAlertRead(alert.id)}
                    className={`flex items-start gap-4 p-4 rounded-xl border cursor-pointer transition-all duration-150 ${
                      alert.isRead ? 'bg-[var(--bg-base)] border-[var(--border-subtle)] opacity-50' : 'bg-[var(--bg-surface)] border-[var(--border)] hover:border-[var(--primary)]'
                    }`}
                  >
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${alert.type === 'OUT_OF_STOCK' ? 'bg-[var(--danger-muted)]' : 'bg-[var(--warning-muted)]'}`}>
                      {alert.type === 'OUT_OF_STOCK' ? <XCircle className="w-5 h-5 text-[var(--danger)]" /> : <AlertTriangle className="w-5 h-5 text-[var(--warning)]" />}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        {alert.type === 'OUT_OF_STOCK' ? <Badge variant="destructive">Rupture</Badge> : <Badge variant="warning">Stock Bas</Badge>}
                        {!alert.isRead && <span className="w-2 h-2 bg-[var(--primary)] rounded-full" />}
                      </div>
                      <p className="font-semibold text-sm">{alert.message}</p>
                      <div className="flex items-center gap-4 mt-2 text-xs text-[var(--text-muted)]">
                        <span className="flex items-center gap-1"><Package className="w-3 h-3" />{prod?.sku || '—'}</span>
                        <span>{wh?.name || '—'}</span>
                        <span>{formatDateTime(alert.createdAt)}</span>
                      </div>
                    </div>
                    {alert.isRead && <CheckCircle className="w-5 h-5 text-[var(--success)] shrink-0" />}
                  </motion.div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
