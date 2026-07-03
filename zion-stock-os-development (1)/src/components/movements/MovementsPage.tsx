import React, { useState, useMemo } from 'react';
import { Search, ArrowDownRight, ArrowUpRight, RefreshCw, Filter, Package } from 'lucide-react';
import { Button, MotionButton } from '../ui/button';
import { Input } from '../ui/input';
import { Badge } from '../ui/badge';
import { Card, CardContent } from '../ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '../ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Label } from '../ui/label';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../ui/table';
import { EmptyState } from '../ui/empty-state';
import { useStore } from '../../store';
import { formatDateTime } from '../../lib/utils';
import { MovementType } from '../../types';
import { toast } from 'sonner';

export const MovementsPage: React.FC = () => {
  const { movements, products, warehouses, user, selectedWarehouseId, addMovement, getStockForProduct } = useStore();
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [movementType, setMovementType] = useState<MovementType>('IN');
  const [formData, setFormData] = useState({ productId: '', warehouseId: '', quantity: 1, reason: '', reference: '' });

  const filtered = useMemo(() => movements.filter(m => {
    const prod = products.find(p => p.id === m.productId);
    const matchS = prod?.name.toLowerCase().includes(search.toLowerCase()) || m.reference?.toLowerCase().includes(search.toLowerCase()) || m.reason.toLowerCase().includes(search.toLowerCase());
    const matchT = typeFilter === 'all' || m.type === typeFilter;
    const matchW = !selectedWarehouseId || m.warehouseId === selectedWarehouseId;
    return matchS && matchT && matchW;
  }), [movements, products, search, typeFilter, selectedWarehouseId]);

  const openDialog = (type: MovementType) => {
    setMovementType(type);
    setFormData({ productId: products[0]?.id || '', warehouseId: selectedWarehouseId || warehouses[0]?.id || '', quantity: 1, reason: type === 'IN' ? 'Réception fournisseur' : type === 'OUT' ? 'Vente client' : 'Ajustement inventaire', reference: '' });
    setIsDialogOpen(true);
  };

  const handleSubmit = () => {
    if (!formData.productId || !formData.warehouseId || formData.quantity <= 0) return;
    addMovement({ productId: formData.productId, warehouseId: formData.warehouseId, type: movementType, quantity: Math.abs(formData.quantity), reason: formData.reason, reference: formData.reference, userId: user?.id || 'unknown' });
    setIsDialogOpen(false);
    toast.success(movementType === 'IN' ? 'Entrée enregistrée' : movementType === 'OUT' ? 'Sortie enregistrée' : 'Ajustement enregistré');
  };

  const selectedProd = products.find(p => p.id === formData.productId);
  const currentStock = selectedProd && formData.warehouseId ? getStockForProduct(selectedProd.id, formData.warehouseId) : 0;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div><h3 className="text-lg font-bold">Mouvements de Stock</h3><p className="text-sm text-[var(--text-muted)]">{movements.length} opérations</p></div>
        <div className="flex gap-2 flex-wrap">
          <MotionButton variant="success" onClick={() => openDialog('IN')}><ArrowDownRight className="w-4 h-4 mr-2" />Entrée</MotionButton>
          <MotionButton variant="destructive" onClick={() => openDialog('OUT')}><ArrowUpRight className="w-4 h-4 mr-2" />Sortie</MotionButton>
          <MotionButton variant="outline" onClick={() => openDialog('ADJUST')}><RefreshCw className="w-4 h-4 mr-2" />Ajustement</MotionButton>
        </div>
      </div>
      <Card><CardContent className="p-4"><div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1"><Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--text-muted)]" /><Input placeholder="Rechercher…" value={search} onChange={e => setSearch(e.target.value)} className="pl-10" /></div>
        <Select value={typeFilter} onValueChange={setTypeFilter}><SelectTrigger className="w-[160px]"><Filter className="w-4 h-4 mr-2" /><SelectValue /></SelectTrigger>
          <SelectContent><SelectItem value="all">Tous</SelectItem><SelectItem value="IN">Entrées</SelectItem><SelectItem value="OUT">Sorties</SelectItem><SelectItem value="ADJUST">Ajustements</SelectItem></SelectContent>
        </Select>
      </div></CardContent></Card>

      <Card><CardContent className="p-0">
        {filtered.length === 0 ? <EmptyState icon={Package} title="Aucun mouvement" description="Enregistrez votre première opération de stock." actionLabel="+ Entrée de stock" onAction={() => openDialog('IN')} /> : (
          <Table><TableHeader><TableRow>
            <TableHead>Date</TableHead><TableHead>Produit</TableHead><TableHead>Entrepôt</TableHead><TableHead className="text-center">Type</TableHead><TableHead className="text-right">Qté</TableHead><TableHead>Motif</TableHead><TableHead>Réf.</TableHead>
          </TableRow></TableHeader>
          <TableBody>{filtered.map(m => {
            const prod = products.find(p => p.id === m.productId);
            const wh = warehouses.find(w => w.id === m.warehouseId);
            return <TableRow key={m.id}>
              <TableCell className="text-xs text-[var(--text-muted)]">{formatDateTime(m.createdAt)}</TableCell>
              <TableCell><p className="font-semibold text-sm">{prod?.name || '—'}</p><p className="text-xs text-[var(--text-muted)] font-mono">{prod?.sku}</p></TableCell>
              <TableCell className="text-sm">{wh?.name || '—'}</TableCell>
              <TableCell className="text-center">{m.type === 'IN' ? <Badge variant="success">Entrée</Badge> : m.type === 'OUT' ? <Badge variant="destructive">Sortie</Badge> : <Badge variant="primary">Ajust.</Badge>}</TableCell>
              <TableCell className={`text-right font-bold ${m.type === 'IN' ? 'text-[var(--success)]' : m.type === 'OUT' ? 'text-[var(--danger)]' : 'text-[var(--primary)]'}`}>{m.type === 'IN' ? '+' : m.type === 'OUT' ? '-' : ''}{m.quantity}</TableCell>
              <TableCell className="max-w-[150px] truncate text-sm">{m.reason}</TableCell>
              <TableCell className="font-mono text-xs text-[var(--text-muted)]">{m.reference || '—'}</TableCell>
            </TableRow>;
          })}</TableBody></Table>
        )}
      </CardContent></Card>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              {movementType === 'IN' ? <ArrowDownRight className="w-5 h-5 text-[var(--success)]" /> : movementType === 'OUT' ? <ArrowUpRight className="w-5 h-5 text-[var(--danger)]" /> : <RefreshCw className="w-5 h-5 text-[var(--primary)]" />}
              {movementType === 'IN' ? 'Entrée' : movementType === 'OUT' ? 'Sortie' : 'Ajustement'} de Stock
            </DialogTitle>
            <DialogDescription>Enregistrer un mouvement</DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-2">
            <div className="space-y-2"><Label>Entrepôt *</Label>
              <Select value={formData.warehouseId} onValueChange={v => setFormData({...formData, warehouseId: v})}><SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>{warehouses.filter(w => w.isActive).map(w => <SelectItem key={w.id} value={w.id}>{w.name}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div className="space-y-2"><Label>Produit *</Label>
              <Select value={formData.productId} onValueChange={v => setFormData({...formData, productId: v})}><SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>{products.filter(p => p.isActive).map(p => <SelectItem key={p.id} value={p.id}>{p.sku} — {p.name}</SelectItem>)}</SelectContent>
              </Select>
              {selectedProd && formData.warehouseId && <p className="text-xs text-[var(--text-muted)]">Stock actuel: <span className="font-bold text-[var(--text-primary)]">{currentStock}</span> {selectedProd.unit}</p>}
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2"><Label>Quantité *</Label><Input type="number" min="1" value={formData.quantity} onChange={e => setFormData({...formData, quantity: +e.target.value})} /></div>
              <div className="space-y-2"><Label>Référence</Label><Input value={formData.reference} onChange={e => setFormData({...formData, reference: e.target.value})} placeholder="CMD-2024-001" /></div>
            </div>
            <div className="space-y-2"><Label>Motif *</Label>
              <Select value={formData.reason} onValueChange={v => setFormData({...formData, reason: v})}><SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {movementType === 'IN' && <><SelectItem value="Réception fournisseur">Réception fournisseur</SelectItem><SelectItem value="Retour client">Retour client</SelectItem><SelectItem value="Transfert entrant">Transfert entrant</SelectItem></>}
                  {movementType === 'OUT' && <><SelectItem value="Vente client">Vente client</SelectItem><SelectItem value="Retour fournisseur">Retour fournisseur</SelectItem><SelectItem value="Perte/Casse">Perte/Casse</SelectItem></>}
                  {movementType === 'ADJUST' && <><SelectItem value="Ajustement inventaire">Ajustement inventaire</SelectItem><SelectItem value="Correction erreur">Correction erreur</SelectItem></>}
                </SelectContent>
              </Select>
            </div>
            {movementType === 'OUT' && currentStock < formData.quantity && (
              <div className="p-3 rounded-xl bg-[var(--warning-muted)] border border-[var(--warning)]/30 text-sm text-[var(--warning)]">⚠️ Stock insuffisant ({currentStock} dispo)</div>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDialogOpen(false)}>Annuler</Button>
            <Button variant={movementType === 'IN' ? 'success' : movementType === 'OUT' ? 'destructive' : 'default'} onClick={handleSubmit} disabled={!formData.productId || !formData.warehouseId || formData.quantity <= 0}>Enregistrer</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};
