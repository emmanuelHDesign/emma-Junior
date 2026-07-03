import React, { useState, useMemo } from 'react';
import { Plus, Search, Edit, Trash2, Warehouse, MapPin, Phone, User, MoreHorizontal } from 'lucide-react';
import { Button, MotionButton } from '../ui/button';
import { Input } from '../ui/input';
import { Badge } from '../ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '../ui/dialog';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '../ui/dropdown-menu';
import { Label } from '../ui/label';
import { EmptyState } from '../ui/empty-state';
import { useStore } from '../../store';
import { formatCurrency } from '../../lib/utils';
import { Warehouse as WHType } from '../../types';
import { motion } from 'framer-motion';
import { toast } from 'sonner';

export const WarehousesPage: React.FC = () => {
  const { warehouses, products, stock, addWarehouse, updateWarehouse, deleteWarehouse } = useStore();
  const [search, setSearch] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const [editing, setEditing] = useState<WHType | null>(null);
  const [delId, setDelId] = useState<string | null>(null);
  const [form, setForm] = useState({ name: '', location: '', manager: '', phone: '' });

  const filtered = useMemo(() => warehouses.filter(w => w.name.toLowerCase().includes(search.toLowerCase()) || w.location.toLowerCase().includes(search.toLowerCase())), [warehouses, search]);

  const getStats = (id: string) => {
    const s = stock.filter(x => x.warehouseId === id);
    let val = 0, items = 0, pc = 0;
    s.forEach(x => { const p = products.find(y => y.id === x.productId); if (p && x.quantity > 0) { val += x.quantity * p.unitPrice; items += x.quantity; pc++; } });
    return { val, items, pc };
  };

  const openCreate = () => { setEditing(null); setForm({ name: '', location: '', manager: '', phone: '' }); setIsOpen(true); };
  const openEdit = (w: WHType) => { setEditing(w); setForm({ name: w.name, location: w.location, manager: w.manager || '', phone: w.phone || '' }); setIsOpen(true); };
  const submit = () => {
    if (editing) { updateWarehouse(editing.id, form); toast.success('Entrepôt modifié'); }
    else { addWarehouse({ ...form, companyId: 'comp-1', isActive: true }); toast.success('Entrepôt créé'); }
    setIsOpen(false);
  };
  const del = (id: string) => { deleteWarehouse(id); setDelId(null); toast.success('Entrepôt supprimé'); };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div><h3 className="text-lg font-bold">Entrepôts & Magasins</h3><p className="text-sm text-[var(--text-muted)]">{warehouses.length} emplacements</p></div>
        <MotionButton variant="accent" onClick={openCreate}><Plus className="w-4 h-4 mr-2" />Nouvel Entrepôt</MotionButton>
      </div>
      <div className="relative max-w-md"><Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--text-muted)]" /><Input placeholder="Rechercher…" value={search} onChange={e => setSearch(e.target.value)} className="pl-10" /></div>

      {filtered.length === 0 ? <Card><CardContent><EmptyState icon={Warehouse} title="Aucun entrepôt" description="Ajoutez votre premier emplacement de stockage." actionLabel="+ Ajouter un entrepôt" onAction={openCreate} /></CardContent></Card> : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map(w => {
            const s = getStats(w.id);
            return (
              <motion.div key={w.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} whileHover={{ y: -2 }} transition={{ duration: 0.2 }}>
                <Card className="relative overflow-hidden group">
                  <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-[var(--primary)] to-[var(--accent)]" />
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-11 h-11 bg-[var(--primary-muted)] rounded-xl flex items-center justify-center"><Warehouse className="w-5 h-5 text-[var(--primary)]" /></div>
                        <div><CardTitle className="text-base">{w.name}</CardTitle><div className="flex items-center gap-1 text-xs text-[var(--text-muted)] mt-0.5"><MapPin className="w-3 h-3" />{w.location}</div></div>
                      </div>
                      <DropdownMenu><DropdownMenuTrigger asChild><Button variant="ghost" size="icon" className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity"><MoreHorizontal className="w-4 h-4" /></Button></DropdownMenuTrigger>
                        <DropdownMenuContent align="end"><DropdownMenuItem onClick={() => openEdit(w)}><Edit className="w-4 h-4 mr-2" />Modifier</DropdownMenuItem><DropdownMenuItem onClick={() => setDelId(w.id)} className="text-[var(--danger)]"><Trash2 className="w-4 h-4 mr-2" />Supprimer</DropdownMenuItem></DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex gap-4 text-xs text-[var(--text-muted)]">
                      {w.manager && <div className="flex items-center gap-1"><User className="w-3 h-3" />{w.manager}</div>}
                      {w.phone && <div className="flex items-center gap-1"><Phone className="w-3 h-3" />{w.phone}</div>}
                    </div>
                    <div className="grid grid-cols-3 gap-2 pt-3 border-t border-[var(--border)]">
                      <div className="text-center"><p className="text-xl font-bold text-[var(--primary)]">{s.pc}</p><p className="text-[10px] text-[var(--text-muted)]">Produits</p></div>
                      <div className="text-center"><p className="text-xl font-bold text-[var(--accent)]">{s.items}</p><p className="text-[10px] text-[var(--text-muted)]">Articles</p></div>
                      <div className="text-center"><p className="text-xs font-bold text-[var(--success)]">{formatCurrency(s.val)}</p><p className="text-[10px] text-[var(--text-muted)]">Valeur</p></div>
                    </div>
                    <Badge variant={w.isActive ? 'success' : 'secondary'}>{w.isActive ? 'Actif' : 'Inactif'}</Badge>
                  </CardContent>
                </Card>
              </motion.div>
            );
          })}
        </div>
      )}

      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="sm:max-w-[450px]">
          <DialogHeader><DialogTitle>{editing ? 'Modifier l\'Entrepôt' : 'Nouvel Entrepôt'}</DialogTitle><DialogDescription>Informations de l'emplacement</DialogDescription></DialogHeader>
          <div className="grid gap-4 py-2">
            <div className="space-y-2"><Label>Nom *</Label><Input value={form.name} onChange={e => setForm({...form, name: e.target.value})} placeholder="Entrepôt Central" /></div>
            <div className="space-y-2"><Label>Localisation *</Label><Input value={form.location} onChange={e => setForm({...form, location: e.target.value})} placeholder="Douala — Akwa" /></div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2"><Label>Responsable</Label><Input value={form.manager} onChange={e => setForm({...form, manager: e.target.value})} /></div>
              <div className="space-y-2"><Label>Téléphone</Label><Input value={form.phone} onChange={e => setForm({...form, phone: e.target.value})} /></div>
            </div>
          </div>
          <DialogFooter><Button variant="outline" onClick={() => setIsOpen(false)}>Annuler</Button><Button variant="accent" onClick={submit} disabled={!form.name || !form.location}>{editing ? 'Enregistrer' : 'Créer'}</Button></DialogFooter>
        </DialogContent>
      </Dialog>
      <Dialog open={!!delId} onOpenChange={() => setDelId(null)}>
        <DialogContent><DialogHeader><DialogTitle>Supprimer cet entrepôt ?</DialogTitle><DialogDescription>Tout le stock associé sera supprimé.</DialogDescription></DialogHeader>
          <DialogFooter><Button variant="outline" onClick={() => setDelId(null)}>Annuler</Button><Button variant="destructive" onClick={() => delId && del(delId)}>Supprimer</Button></DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};
