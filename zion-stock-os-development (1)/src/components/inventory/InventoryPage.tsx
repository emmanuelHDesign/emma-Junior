import React, { useState, useMemo } from 'react';
import { Search, Download, Filter, Package, AlertTriangle, CheckCircle, XCircle } from 'lucide-react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Badge } from '../ui/badge';
import { Card, CardContent } from '../ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../ui/table';
import { StatCard } from '../ui/stat-card';
import { EmptyState } from '../ui/empty-state';
import { useStore } from '../../store';
import { formatCurrency } from '../../lib/utils';
import { motion } from 'framer-motion';
import { toast } from 'sonner';
import { DollarSign, Boxes } from 'lucide-react';

export const InventoryPage: React.FC = () => {
  const { products, warehouses, stock, selectedWarehouseId, categories } = useStore();
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');

  const inventory = useMemo(() => products.map(p => {
    const whStocks = warehouses.map(wh => ({ warehouseId: wh.id, warehouseName: wh.name, quantity: stock.find(s => s.productId === p.id && s.warehouseId === wh.id)?.quantity || 0 }));
    const total = whStocks.reduce((s, ws) => s + ws.quantity, 0);
    const status: 'ok' | 'low' | 'out' = total === 0 ? 'out' : total < p.minStock ? 'low' : 'ok';
    return { ...p, whStocks, totalStock: total, stockValue: total * p.unitPrice, status };
  }), [products, warehouses, stock]);

  const filtered = useMemo(() => inventory.filter(i => {
    const mS = i.name.toLowerCase().includes(search.toLowerCase()) || i.sku.toLowerCase().includes(search.toLowerCase());
    const mC = categoryFilter === 'all' || i.category === categoryFilter;
    const mSt = statusFilter === 'all' || i.status === statusFilter;
    return mS && mC && mSt;
  }), [inventory, search, categoryFilter, statusFilter]);

  const stats = useMemo(() => {
    const totalV = filtered.reduce((s, i) => s + i.stockValue, 0);
    const totalI = filtered.reduce((s, i) => s + i.totalStock, 0);
    return { totalV, totalI, ok: filtered.filter(i => i.status === 'ok').length, low: filtered.filter(i => i.status === 'low').length, out: filtered.filter(i => i.status === 'out').length };
  }, [filtered]);

  const exportCSV = () => {
    const rows = [['SKU', 'Produit', 'Catégorie', 'Stock', 'Min', 'Prix', 'Valeur', 'État'].join(';'), ...filtered.map(i => [i.sku, i.name, i.category, i.totalStock, i.minStock, i.unitPrice, i.stockValue, i.status === 'ok' ? 'OK' : i.status === 'low' ? 'Bas' : 'Rupture'].join(';'))].join('\n');
    const blob = new Blob([rows], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a'); link.href = URL.createObjectURL(blob); link.download = `inventaire_${new Date().toISOString().split('T')[0]}.csv`; link.click();
    toast.success('Export CSV réussi');
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div><h3 className="text-lg font-bold">Inventaire Global</h3><p className="text-sm text-[var(--text-muted)]">Vue consolidée tous entrepôts</p></div>
        <Button variant="outline" onClick={exportCSV}><Download className="w-4 h-4 mr-2" />Export CSV</Button>
      </div>

      <motion.div className="grid grid-cols-2 md:grid-cols-5 gap-3" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
        <StatCard title="Valeur" value={formatCurrency(stats.totalV)} icon={DollarSign} accent="primary" />
        <StatCard title="Articles" value={stats.totalI} icon={Boxes} accent="accent" />
        <StatCard title="Stock OK" value={stats.ok} icon={CheckCircle} accent="success" />
        <StatCard title="Stock Bas" value={stats.low} icon={AlertTriangle} accent="warning" />
        <StatCard title="Ruptures" value={stats.out} icon={XCircle} accent="danger" />
      </motion.div>

      <Card><CardContent className="p-4"><div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1"><Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--text-muted)]" /><Input placeholder="Rechercher…" value={search} onChange={e => setSearch(e.target.value)} className="pl-10" /></div>
        <Select value={categoryFilter} onValueChange={setCategoryFilter}><SelectTrigger className="w-[160px]"><Filter className="w-4 h-4 mr-2" /><SelectValue /></SelectTrigger>
          <SelectContent><SelectItem value="all">Toutes</SelectItem>{categories.map(c => <SelectItem key={c.id} value={c.name}>{c.name}</SelectItem>)}</SelectContent>
        </Select>
        <Select value={statusFilter} onValueChange={setStatusFilter}><SelectTrigger className="w-[130px]"><SelectValue /></SelectTrigger>
          <SelectContent><SelectItem value="all">Tous</SelectItem><SelectItem value="ok">OK</SelectItem><SelectItem value="low">Bas</SelectItem><SelectItem value="out">Rupture</SelectItem></SelectContent>
        </Select>
      </div></CardContent></Card>

      <Card><CardContent className="p-0">
        {filtered.length === 0 ? <EmptyState icon={Package} title="Aucun produit" description="Aucun produit ne correspond à vos filtres." /> : (
          <Table><TableHeader><TableRow>
            <TableHead>SKU</TableHead><TableHead>Produit</TableHead><TableHead>Catégorie</TableHead>
            {!selectedWarehouseId && warehouses.map(wh => <TableHead key={wh.id} className="text-center text-[10px]">{wh.name.split(' ').slice(0, 2).join(' ')}</TableHead>)}
            <TableHead className="text-right">Total</TableHead><TableHead className="text-right">Valeur</TableHead><TableHead className="text-center">État</TableHead>
          </TableRow></TableHeader>
          <TableBody>{filtered.map(i => (
            <TableRow key={i.id}>
              <TableCell className="font-mono text-xs text-[var(--text-muted)]">{i.sku}</TableCell>
              <TableCell className="font-semibold text-sm">{i.name}</TableCell>
              <TableCell><Badge variant="secondary">{i.category}</Badge></TableCell>
              {!selectedWarehouseId && i.whStocks.map(ws => <TableCell key={ws.warehouseId} className={`text-center text-sm ${ws.quantity === 0 ? 'text-[var(--danger)]' : ws.quantity < i.minStock / warehouses.length ? 'text-[var(--warning)]' : ''}`}>{ws.quantity}</TableCell>)}
              <TableCell className="text-right font-bold">{selectedWarehouseId ? i.whStocks.find(ws => ws.warehouseId === selectedWarehouseId)?.quantity || 0 : i.totalStock}</TableCell>
              <TableCell className="text-right font-semibold text-[var(--primary)]">{formatCurrency(i.stockValue)}</TableCell>
              <TableCell className="text-center">{i.status === 'ok' ? <Badge variant="success">OK</Badge> : i.status === 'low' ? <Badge variant="warning">Bas</Badge> : <Badge variant="destructive">Rupture</Badge>}</TableCell>
            </TableRow>
          ))}</TableBody></Table>
        )}
      </CardContent></Card>
    </div>
  );
};
