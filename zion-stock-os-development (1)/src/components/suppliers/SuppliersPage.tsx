import React, { useState, useMemo } from 'react';
import { Plus, Search, Edit, Trash2, Truck, Phone, Mail, MoreHorizontal } from 'lucide-react';
import { Button, MotionButton } from '../ui/button';
import { Input } from '../ui/input';
import { Badge } from '../ui/badge';
import { Card, CardContent } from '../ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '../ui/dialog';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '../ui/dropdown-menu';
import { Label } from '../ui/label';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../ui/table';
import { EmptyState } from '../ui/empty-state';
import { useStore } from '../../store';
import { Supplier } from '../../types';
import { toast } from 'sonner';

export const SuppliersPage: React.FC = () => {
  const { suppliers, addSupplier, updateSupplier, deleteSupplier } = useStore();
  const [search, setSearch] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const [editing, setEditing] = useState<Supplier | null>(null);
  const [delId, setDelId] = useState<string | null>(null);
  const [form, setForm] = useState({ name: '', contact: '', phone: '', email: '', address: '' });
  const filtered = useMemo(() => suppliers.filter(s => s.name.toLowerCase().includes(search.toLowerCase())), [suppliers, search]);
  const openCreate = () => { setEditing(null); setForm({ name: '', contact: '', phone: '', email: '', address: '' }); setIsOpen(true); };
  const openEdit = (s: Supplier) => { setEditing(s); setForm({ name: s.name, contact: s.contact || '', phone: s.phone || '', email: s.email || '', address: s.address || '' }); setIsOpen(true); };
  const submit = () => { if (editing) { updateSupplier(editing.id, form); toast.success('Fournisseur modifié'); } else { addSupplier({ ...form, companyId: 'comp-1', isActive: true }); toast.success('Fournisseur créé'); } setIsOpen(false); };
  const del = (id: string) => { deleteSupplier(id); setDelId(null); toast.success('Fournisseur supprimé'); };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div><h3 className="text-lg font-bold">Fournisseurs</h3><p className="text-sm text-[var(--text-muted)]">{suppliers.length} fournisseurs</p></div>
        <MotionButton variant="accent" onClick={openCreate}><Plus className="w-4 h-4 mr-2" />Nouveau Fournisseur</MotionButton>
      </div>
      <Card><CardContent className="p-4"><div className="relative max-w-md"><Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--text-muted)]" /><Input placeholder="Rechercher…" value={search} onChange={e => setSearch(e.target.value)} className="pl-10" /></div></CardContent></Card>
      <Card><CardContent className="p-0">
        {filtered.length === 0 ? <EmptyState icon={Truck} title="Aucun fournisseur" description="Ajoutez votre premier fournisseur." actionLabel="+ Ajouter" onAction={openCreate} /> : (
          <Table><TableHeader><TableRow><TableHead>Fournisseur</TableHead><TableHead>Contact</TableHead><TableHead>Téléphone</TableHead><TableHead>Email</TableHead><TableHead className="text-center">État</TableHead><TableHead className="w-10"></TableHead></TableRow></TableHeader>
            <TableBody>{filtered.map(s => (
              <TableRow key={s.id}>
                <TableCell><div className="flex items-center gap-3"><div className="w-9 h-9 bg-[var(--primary-muted)] rounded-lg flex items-center justify-center"><Truck className="w-4 h-4 text-[var(--primary)]" /></div><span className="font-semibold">{s.name}</span></div></TableCell>
                <TableCell className="text-sm">{s.contact || '—'}</TableCell>
                <TableCell className="text-sm">{s.phone ? <span className="flex items-center gap-1"><Phone className="w-3 h-3 text-[var(--text-muted)]" />{s.phone}</span> : '—'}</TableCell>
                <TableCell className="text-sm">{s.email ? <span className="flex items-center gap-1"><Mail className="w-3 h-3 text-[var(--text-muted)]" />{s.email}</span> : '—'}</TableCell>
                <TableCell className="text-center"><Badge variant={s.isActive ? 'success' : 'secondary'}>{s.isActive ? 'Actif' : 'Inactif'}</Badge></TableCell>
                <TableCell><DropdownMenu><DropdownMenuTrigger asChild><Button variant="ghost" size="icon" className="h-8 w-8"><MoreHorizontal className="w-4 h-4" /></Button></DropdownMenuTrigger>
                  <DropdownMenuContent align="end"><DropdownMenuItem onClick={() => openEdit(s)}><Edit className="w-4 h-4 mr-2" />Modifier</DropdownMenuItem><DropdownMenuItem onClick={() => setDelId(s.id)} className="text-[var(--danger)]"><Trash2 className="w-4 h-4 mr-2" />Supprimer</DropdownMenuItem></DropdownMenuContent>
                </DropdownMenu></TableCell>
              </TableRow>
            ))}</TableBody></Table>
        )}
      </CardContent></Card>
      <Dialog open={isOpen} onOpenChange={setIsOpen}><DialogContent className="sm:max-w-[450px]"><DialogHeader><DialogTitle>{editing ? 'Modifier' : 'Nouveau'} Fournisseur</DialogTitle><DialogDescription>Informations du fournisseur</DialogDescription></DialogHeader>
        <div className="grid gap-4 py-2">
          <div className="space-y-2"><Label>Nom *</Label><Input value={form.name} onChange={e => setForm({...form, name: e.target.value})} /></div>
          <div className="grid grid-cols-2 gap-4"><div className="space-y-2"><Label>Contact</Label><Input value={form.contact} onChange={e => setForm({...form, contact: e.target.value})} /></div><div className="space-y-2"><Label>Téléphone</Label><Input value={form.phone} onChange={e => setForm({...form, phone: e.target.value})} /></div></div>
          <div className="space-y-2"><Label>Email</Label><Input type="email" value={form.email} onChange={e => setForm({...form, email: e.target.value})} /></div>
          <div className="space-y-2"><Label>Adresse</Label><Input value={form.address} onChange={e => setForm({...form, address: e.target.value})} /></div>
        </div>
        <DialogFooter><Button variant="outline" onClick={() => setIsOpen(false)}>Annuler</Button><Button variant="accent" onClick={submit} disabled={!form.name}>{editing ? 'Enregistrer' : 'Créer'}</Button></DialogFooter>
      </DialogContent></Dialog>
      <Dialog open={!!delId} onOpenChange={() => setDelId(null)}><DialogContent><DialogHeader><DialogTitle>Supprimer ?</DialogTitle><DialogDescription>Confirmer la suppression du fournisseur.</DialogDescription></DialogHeader>
        <DialogFooter><Button variant="outline" onClick={() => setDelId(null)}>Annuler</Button><Button variant="destructive" onClick={() => delId && del(delId)}>Supprimer</Button></DialogFooter>
      </DialogContent></Dialog>
    </div>
  );
};
