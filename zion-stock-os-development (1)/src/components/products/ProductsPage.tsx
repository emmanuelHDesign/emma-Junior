import React, { useState, useMemo } from 'react';
import { Plus, Search, Edit, Trash2, Package, Filter, MoreHorizontal } from 'lucide-react';
import { Button, MotionButton } from '../ui/button';
import { Input } from '../ui/input';
import { Badge } from '../ui/badge';
import { Card, CardContent } from '../ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '../ui/dialog';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '../ui/dropdown-menu';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Label } from '../ui/label';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../ui/table';
import { EmptyState } from '../ui/empty-state';
import { useStore } from '../../store';
import { formatCurrency } from '../../lib/utils';
import { Product } from '../../types';
import { motion } from 'framer-motion';
import { toast } from 'sonner';

export const ProductsPage: React.FC = () => {
  const { products, categories, selectedWarehouseId, addProduct, updateProduct, deleteProduct, getTotalStockForProduct, getStockForProduct } = useStore();
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
  const [formData, setFormData] = useState({ sku: '', name: '', description: '', category: '', unitPrice: 0, costPrice: 0, unit: 'Pièce', minStock: 10 });

  const filteredProducts = useMemo(() => {
    return products.filter(p => {
      const matchSearch = p.name.toLowerCase().includes(search.toLowerCase()) || p.sku.toLowerCase().includes(search.toLowerCase());
      const matchCat = categoryFilter === 'all' || p.category === categoryFilter;
      return matchSearch && matchCat;
    });
  }, [products, search, categoryFilter]);

  const getProductStock = (pid: string) => selectedWarehouseId ? getStockForProduct(pid, selectedWarehouseId) : getTotalStockForProduct(pid);

  const openCreateDialog = () => {
    setEditingProduct(null);
    setFormData({ sku: `PRD-${String(products.length + 1).padStart(5, '0')}`, name: '', description: '', category: categories[0]?.name || '', unitPrice: 0, costPrice: 0, unit: 'Pièce', minStock: 10 });
    setIsDialogOpen(true);
  };
  const openEditDialog = (p: Product) => {
    setEditingProduct(p);
    setFormData({ sku: p.sku, name: p.name, description: p.description || '', category: p.category, unitPrice: p.unitPrice, costPrice: p.costPrice || 0, unit: p.unit, minStock: p.minStock });
    setIsDialogOpen(true);
  };
  const handleSubmit = () => {
    if (editingProduct) { updateProduct(editingProduct.id, formData); toast.success('Produit modifié'); }
    else { addProduct({ ...formData, companyId: 'comp-1', isActive: true }); toast.success('Produit créé'); }
    setIsDialogOpen(false);
  };
  const handleDelete = (id: string) => { deleteProduct(id); setDeleteConfirm(null); toast.success('Produit supprimé'); };

  const getStockBadge = (qty: number, min: number) => {
    if (qty === 0) return <Badge variant="destructive">Rupture</Badge>;
    if (qty < min) return <Badge variant="warning">Bas</Badge>;
    return <Badge variant="success">OK</Badge>;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h3 className="text-lg font-bold">Catalogue Produits</h3>
          <p className="text-sm text-[var(--text-muted)]">{products.length} produits référencés</p>
        </div>
        <MotionButton variant="accent" onClick={openCreateDialog}>
          <Plus className="w-4 h-4 mr-2" />Nouveau Produit
        </MotionButton>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--text-muted)]" />
              <Input placeholder="Rechercher par nom ou SKU…" value={search} onChange={(e) => setSearch(e.target.value)} className="pl-10" />
            </div>
            <Select value={categoryFilter} onValueChange={setCategoryFilter}>
              <SelectTrigger className="w-[180px]"><Filter className="w-4 h-4 mr-2" /><SelectValue placeholder="Catégorie" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Toutes</SelectItem>
                {categories.map(c => <SelectItem key={c.id} value={c.name}>{c.name}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Table */}
      <Card>
        <CardContent className="p-0">
          {filteredProducts.length === 0 ? (
            <EmptyState icon={Package} title="Aucun produit trouvé" description="Commence par ajouter ton premier produit au catalogue." actionLabel="+ Ajouter un produit" onAction={openCreateDialog} />
          ) : (
            <>
              {/* Desktop table */}
              <div className="hidden md:block">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>SKU</TableHead>
                      <TableHead>Produit</TableHead>
                      <TableHead>Catégorie</TableHead>
                      <TableHead className="text-right">Prix</TableHead>
                      <TableHead className="text-right">Stock</TableHead>
                      <TableHead className="text-center">État</TableHead>
                      <TableHead className="w-10"></TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredProducts.map(p => {
                      const qty = getProductStock(p.id);
                      return (
                        <TableRow key={p.id}>
                          <TableCell className="font-mono text-xs text-[var(--text-muted)]">{p.sku}</TableCell>
                          <TableCell><span className="font-semibold">{p.name}</span></TableCell>
                          <TableCell><Badge variant="secondary">{p.category}</Badge></TableCell>
                          <TableCell className="text-right font-semibold">{formatCurrency(p.unitPrice)}</TableCell>
                          <TableCell className="text-right">
                            <span className={qty === 0 ? 'text-[var(--danger)] font-bold' : qty < p.minStock ? 'text-[var(--warning)] font-bold' : 'font-semibold'}>{qty}</span>
                            <span className="text-[var(--text-muted)] text-xs ml-1">{p.unit}</span>
                          </TableCell>
                          <TableCell className="text-center">{getStockBadge(qty, p.minStock)}</TableCell>
                          <TableCell>
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild><Button variant="ghost" size="icon" className="h-8 w-8"><MoreHorizontal className="w-4 h-4" /></Button></DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                <DropdownMenuItem onClick={() => openEditDialog(p)}><Edit className="w-4 h-4 mr-2" />Modifier</DropdownMenuItem>
                                <DropdownMenuItem onClick={() => setDeleteConfirm(p.id)} className="text-[var(--danger)]"><Trash2 className="w-4 h-4 mr-2" />Supprimer</DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </div>
              {/* Mobile cards */}
              <div className="md:hidden space-y-2 p-4">
                {filteredProducts.map(p => {
                  const qty = getProductStock(p.id);
                  return (
                    <motion.div key={p.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="p-4 rounded-xl bg-[var(--bg-base)] border border-[var(--border)] space-y-2">
                      <div className="flex justify-between items-start">
                        <div><p className="font-semibold text-sm">{p.name}</p><p className="text-xs text-[var(--text-muted)] font-mono">{p.sku}</p></div>
                        {getStockBadge(qty, p.minStock)}
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-[var(--text-muted)]">{formatCurrency(p.unitPrice)}</span>
                        <span className="font-bold">{qty} {p.unit}</span>
                      </div>
                      <div className="flex gap-2">
                        <Button variant="outline" size="sm" onClick={() => openEditDialog(p)} className="flex-1"><Edit className="w-3 h-3 mr-1" />Modifier</Button>
                        <Button variant="ghost" size="sm" onClick={() => setDeleteConfirm(p.id)} className="text-[var(--danger)]"><Trash2 className="w-3 h-3" /></Button>
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            </>
          )}
        </CardContent>
      </Card>

      {/* Create/Edit Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>{editingProduct ? 'Modifier le Produit' : 'Nouveau Produit'}</DialogTitle>
            <DialogDescription>{editingProduct ? 'Mettre à jour les informations' : 'Ajouter au catalogue ZION PAPER'}</DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-2">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2"><Label>SKU</Label><Input value={formData.sku} onChange={e => setFormData({...formData, sku: e.target.value})} /></div>
              <div className="space-y-2"><Label>Unité</Label>
                <Select value={formData.unit} onValueChange={v => setFormData({...formData, unit: v})}><SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent><SelectItem value="Pièce">Pièce</SelectItem><SelectItem value="Lot">Lot</SelectItem><SelectItem value="Ramette">Ramette</SelectItem><SelectItem value="Carton">Carton</SelectItem><SelectItem value="Kg">Kg</SelectItem></SelectContent>
                </Select>
              </div>
            </div>
            <div className="space-y-2"><Label>Nom *</Label><Input value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} placeholder="Ramette Papier A4" /></div>
            <div className="space-y-2"><Label>Catégorie</Label>
              <Select value={formData.category} onValueChange={v => setFormData({...formData, category: v})}><SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>{categories.map(c => <SelectItem key={c.id} value={c.name}>{c.name}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-2"><Label>Prix Vente</Label><Input type="number" value={formData.unitPrice} onChange={e => setFormData({...formData, unitPrice: +e.target.value})} /></div>
              <div className="space-y-2"><Label>Prix Achat</Label><Input type="number" value={formData.costPrice} onChange={e => setFormData({...formData, costPrice: +e.target.value})} /></div>
              <div className="space-y-2"><Label>Stock Min</Label><Input type="number" value={formData.minStock} onChange={e => setFormData({...formData, minStock: +e.target.value})} /></div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDialogOpen(false)}>Annuler</Button>
            <Button variant="accent" onClick={handleSubmit} disabled={!formData.name}>{editingProduct ? 'Enregistrer' : 'Créer'}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      {/* Delete Dialog */}
      <Dialog open={!!deleteConfirm} onOpenChange={() => setDeleteConfirm(null)}>
        <DialogContent>
          <DialogHeader><DialogTitle>Supprimer ce produit ?</DialogTitle><DialogDescription>Cette action est irréversible.</DialogDescription></DialogHeader>
          <DialogFooter><Button variant="outline" onClick={() => setDeleteConfirm(null)}>Annuler</Button><Button variant="destructive" onClick={() => deleteConfirm && handleDelete(deleteConfirm)}>Supprimer</Button></DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};
