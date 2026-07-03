import React, { useMemo } from 'react';
import { DollarSign, AlertTriangle, ArrowDownRight, ArrowUpRight, TrendingUp, Package } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';

import { StatCard } from '../ui/stat-card';
import { useStore } from '../../store';
import { formatCurrency, formatDateTime } from '../../lib/utils';
import { motion } from 'framer-motion';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, Cell } from 'recharts';

const COLORS = ['var(--primary)', 'var(--accent)', 'var(--success)', 'var(--warning)', 'var(--danger)'];

const fadeUp = { initial: { opacity: 0, y: 20 }, animate: { opacity: 1, y: 0 }, transition: { duration: 0.35 } };

export const Dashboard: React.FC = () => {
  const { products, warehouses, stock, movements, selectedWarehouseId } = useStore();

  const stats = useMemo(() => {
    const filteredStock = selectedWarehouseId ? stock.filter(s => s.warehouseId === selectedWarehouseId) : stock;
    let totalStockValue = 0, lowStockItems = 0, outOfStockItems = 0;
    products.forEach(product => {
      const totalQty = filteredStock.filter(s => s.productId === product.id).reduce((sum, s) => sum + s.quantity, 0);
      totalStockValue += totalQty * product.unitPrice;
      if (totalQty === 0) outOfStockItems++;
      else if (totalQty < product.minStock) lowStockItems++;
    });
    const now = Date.now();
    const weekAgo = now - 7 * 86400000;
    const entriesWeek = movements.filter(m => m.type === 'IN' && new Date(m.createdAt).getTime() > weekAgo).reduce((s, m) => s + m.quantity, 0);
    const exitsWeek = movements.filter(m => m.type === 'OUT' && new Date(m.createdAt).getTime() > weekAgo).reduce((s, m) => s + m.quantity, 0);
    return { totalStockValue, lowStockItems, outOfStockItems, alertsTotal: lowStockItems + outOfStockItems, entriesWeek, exitsWeek };
  }, [products, stock, movements, selectedWarehouseId]);

  const movementChartData = useMemo(() => {
    const days: { name: string; entrees: number; sorties: number }[] = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date(Date.now() - i * 86400000);
      const dayLabel = d.toLocaleDateString('fr-FR', { weekday: 'short', day: '2-digit' });
      const dayStart = new Date(d); dayStart.setHours(0, 0, 0, 0);
      const dayEnd = new Date(d); dayEnd.setHours(23, 59, 59, 999);
      const entrees = movements.filter(m => m.type === 'IN' && new Date(m.createdAt) >= dayStart && new Date(m.createdAt) <= dayEnd).reduce((s, m) => s + m.quantity, 0);
      const sorties = movements.filter(m => m.type === 'OUT' && new Date(m.createdAt) >= dayStart && new Date(m.createdAt) <= dayEnd).reduce((s, m) => s + m.quantity, 0);
      days.push({ name: dayLabel, entrees, sorties });
    }
    return days;
  }, [movements]);

  const topProducts = useMemo(() => {
    return products.map(p => {
      const totalQty = stock.filter(s => s.productId === p.id).reduce((sum, s) => sum + s.quantity, 0);
      return { name: p.name.length > 20 ? p.name.substring(0, 20) + '…' : p.name, stock: totalQty, sku: p.sku, value: totalQty * p.unitPrice };
    }).sort((a, b) => b.value - a.value).slice(0, 5);
  }, [products, stock]);

  const recentMovements = useMemo(() => {
    return movements.slice(0, 6).map(m => {
      const product = products.find(p => p.id === m.productId);
      const warehouse = warehouses.find(w => w.id === m.warehouseId);
      return { ...m, productName: product?.name || '—', warehouseName: warehouse?.name || '—' };
    });
  }, [movements, products, warehouses]);

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (!active || !payload) return null;
    return (
      <div className="glass rounded-xl p-3 text-xs space-y-1 shadow-xl">
        <p className="font-semibold text-[var(--text-primary)]">{label}</p>
        {payload.map((p: any, i: number) => (
          <p key={i} style={{ color: p.color }}>{p.name}: {p.value}</p>
        ))}
      </div>
    );
  };

  return (
    <div className="space-y-6">
      {/* KPIs */}
      <motion.div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4" {...fadeUp}>
        <StatCard title="Valeur Totale Stock" value={formatCurrency(stats.totalStockValue)} icon={DollarSign} accent="primary" delta={{ value: '+12.5%', positive: true }} />
        <StatCard title="Alertes Rupture" value={stats.alertsTotal} icon={AlertTriangle} accent="danger" delta={stats.outOfStockItems > 0 ? { value: `${stats.outOfStockItems} rupture(s)`, positive: false } : undefined} />
        <StatCard title="Entrées 7 jours" value={stats.entriesWeek} icon={ArrowDownRight} accent="success" />
        <StatCard title="Sorties 7 jours" value={stats.exitsWeek} icon={ArrowUpRight} accent="warning" />
      </motion.div>

      {/* Charts */}
      <motion.div className="grid grid-cols-1 lg:grid-cols-3 gap-6" {...fadeUp} transition={{ delay: 0.1, duration: 0.35 }}>
        {/* Movement Area Chart */}
        <Card className="lg:col-span-2">
          <CardHeader><CardTitle className="flex items-center gap-2"><TrendingUp className="w-4 h-4 text-[var(--primary)]" />Mouvements 7 jours</CardTitle></CardHeader>
          <CardContent>
            <div className="h-[280px]">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={movementChartData}>
                  <defs>
                    <linearGradient id="gradIn" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="var(--success)" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="var(--success)" stopOpacity={0} />
                    </linearGradient>
                    <linearGradient id="gradOut" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="var(--danger)" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="var(--danger)" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                  <XAxis dataKey="name" tick={{ fill: 'var(--text-muted)', fontSize: 11 }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fill: 'var(--text-muted)', fontSize: 11 }} axisLine={false} tickLine={false} />
                  <Tooltip content={<CustomTooltip />} />
                  <Area type="monotone" dataKey="entrees" name="Entrées" stroke="var(--success)" fill="url(#gradIn)" strokeWidth={2} />
                  <Area type="monotone" dataKey="sorties" name="Sorties" stroke="var(--danger)" fill="url(#gradOut)" strokeWidth={2} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Top 5 Products */}
        <Card>
          <CardHeader><CardTitle className="flex items-center gap-2"><Package className="w-4 h-4 text-[var(--accent)]" />Top 5 Produits</CardTitle></CardHeader>
          <CardContent>
            <div className="h-[280px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={topProducts} layout="vertical" margin={{ left: 0, right: 10 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" horizontal={false} />
                  <XAxis type="number" tick={{ fill: 'var(--text-muted)', fontSize: 10 }} axisLine={false} tickLine={false} />
                  <YAxis type="category" dataKey="name" width={110} tick={{ fill: 'var(--text-secondary)', fontSize: 10 }} axisLine={false} tickLine={false} />
                  <Tooltip content={<CustomTooltip />} />
                  <Bar dataKey="stock" name="Stock" radius={[0, 6, 6, 0]} barSize={20}>
                    {topProducts.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Recent Movements */}
      <motion.div {...fadeUp} transition={{ delay: 0.2, duration: 0.35 }}>
        <Card>
          <CardHeader><CardTitle>Derniers Mouvements</CardTitle></CardHeader>
          <CardContent>
            <div className="space-y-2">
              {recentMovements.map((mv) => (
                <div key={mv.id} className="flex items-center gap-4 p-3 rounded-xl bg-[var(--bg-base)] hover:bg-[var(--bg-hover)] transition-colors duration-150">
                  <div className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-0 ${
                    mv.type === 'IN' ? 'bg-[var(--success-muted)]' : mv.type === 'OUT' ? 'bg-[var(--danger-muted)]' : 'bg-[var(--primary-muted)]'
                  }`}>
                    {mv.type === 'IN' ? <ArrowDownRight className="w-4 h-4 text-[var(--success)]" /> : mv.type === 'OUT' ? <ArrowUpRight className="w-4 h-4 text-[var(--danger)]" /> : <TrendingUp className="w-4 h-4 text-[var(--primary)]" />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold truncate">{mv.productName}</p>
                    <p className="text-xs text-[var(--text-muted)]">{mv.warehouseName}</p>
                  </div>
                  <div className="text-right shrink-0">
                    <p className={`text-sm font-bold ${mv.type === 'IN' ? 'text-[var(--success)]' : mv.type === 'OUT' ? 'text-[var(--danger)]' : 'text-[var(--primary)]'}`}>
                      {mv.type === 'IN' ? '+' : mv.type === 'OUT' ? '-' : ''}{mv.quantity}
                    </p>
                    <p className="text-[10px] text-[var(--text-muted)]">{formatDateTime(mv.createdAt)}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
};
