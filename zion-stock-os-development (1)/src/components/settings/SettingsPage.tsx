import React, { useState } from 'react';
import { Building2, User, Database, Save, RefreshCw, Shield, Key, Eye, EyeOff, CheckCircle, AlertCircle, LogOut } from 'lucide-react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../ui/card';
import { Badge } from '../ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { useStore } from '../../store';
import { useAuth, useIsAdmin } from '../../hooks/useAuth';
import { validatePassword } from '../../lib/auth';
import { toast } from 'sonner';

export const SettingsPage: React.FC = () => {
  const { company, categories, addCategory, generateAlerts } = useStore();
  const { user, logout } = useAuth();
  const isAdmin = useIsAdmin();
  const [companyForm, setCompanyForm] = useState({ name: company.name, address: company.address || '', phone: company.phone || '', email: company.email || '' });
  const [newCat, setNewCat] = useState({ name: '', description: '', color: '#5B8DEF' });
  const [pwForm, setPwForm] = useState({ current: '', next: '', confirm: '' });
  const [showPw, setShowPw] = useState(false);
  const [pwError, setPwError] = useState<string | null>(null);

  const handleAddCat = () => { if (newCat.name) { addCategory(newCat); setNewCat({ name: '', description: '', color: '#5B8DEF' }); toast.success('Catégorie ajoutée'); } };
  const handleChangePw = () => {
    setPwError(null);
    if (!pwForm.current) { setPwError('Mot de passe actuel requis'); return; }
    const v = validatePassword(pwForm.next);
    if (!v.valid) { setPwError(v.message); return; }
    if (pwForm.next !== pwForm.confirm) { setPwError('Non identiques'); return; }
    setPwForm({ current: '', next: '', confirm: '' });
    toast.success('Mot de passe modifié');
  };

  const roleBadge = (r: string) => r === 'admin' ? <Badge variant="primary">Admin</Badge> : r === 'magasinier' ? <Badge variant="accent">Magasinier</Badge> : <Badge variant="secondary">Vendeur</Badge>;

  return (
    <div className="space-y-6">
      <div><h3 className="text-lg font-bold">Paramètres</h3><p className="text-sm text-[var(--text-muted)]">Configuration ZION STOCK OS</p></div>

      <Tabs defaultValue="profile" className="space-y-6">
        <TabsList>
          <TabsTrigger value="profile"><User className="w-4 h-4 mr-2" />Profil</TabsTrigger>
          <TabsTrigger value="security"><Shield className="w-4 h-4 mr-2" />Sécurité</TabsTrigger>
          {isAdmin && <TabsTrigger value="company"><Building2 className="w-4 h-4 mr-2" />Entreprise</TabsTrigger>}
          {isAdmin && <TabsTrigger value="system"><Database className="w-4 h-4 mr-2" />Système</TabsTrigger>}
        </TabsList>

        <TabsContent value="profile">
          <Card>
            <CardHeader><CardTitle>Mon Profil</CardTitle></CardHeader>
            <CardContent className="space-y-6">
              {user && <>
                <div className="flex items-center gap-6 p-6 rounded-xl bg-gradient-to-r from-[var(--primary)] to-[var(--primary)]/60 text-white">
                  <div className="w-16 h-16 bg-[var(--accent)] rounded-2xl flex items-center justify-center text-2xl font-extrabold text-[#0A0E13]">{user.name.charAt(0)}</div>
                  <div><h3 className="text-xl font-bold">{user.name}</h3><p className="text-white/60 text-sm">{user.email}</p><div className="mt-2">{roleBadge(user.role)}</div></div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2"><Label>Nom</Label><Input value={user.name} readOnly className="bg-[var(--bg-base)]" /></div>
                  <div className="space-y-2"><Label>Email</Label><Input value={user.email} readOnly className="bg-[var(--bg-base)]" /></div>
                </div>
                <Button variant="destructive" onClick={logout}><LogOut className="w-4 h-4 mr-2" />Se déconnecter</Button>
              </>}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="security">
          <Card>
            <CardHeader><CardTitle className="flex items-center gap-2"><Key className="w-5 h-5" />Sécurité</CardTitle><CardDescription>Gestion du mot de passe</CardDescription></CardHeader>
            <CardContent className="space-y-6 max-w-md">
              {pwError && <div className="p-3 rounded-xl bg-[var(--danger-muted)] border border-[var(--danger)]/30 flex items-center gap-2 text-[var(--danger)] text-sm"><AlertCircle className="w-4 h-4" />{pwError}</div>}
              <div className="space-y-2"><Label>Mot de passe actuel</Label><Input type={showPw ? 'text' : 'password'} value={pwForm.current} onChange={e => setPwForm({...pwForm, current: e.target.value})} /></div>
              <div className="space-y-2"><Label>Nouveau mot de passe</Label>
                <div className="relative"><Input type={showPw ? 'text' : 'password'} value={pwForm.next} onChange={e => setPwForm({...pwForm, next: e.target.value})} />
                  <button type="button" onClick={() => setShowPw(!showPw)} className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)]">{showPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}</button>
                </div>
                {pwForm.next && <div className="text-xs space-y-0.5">{[['8 caractères', pwForm.next.length >= 8], ['Majuscule', /[A-Z]/.test(pwForm.next)], ['Minuscule', /[a-z]/.test(pwForm.next)], ['Chiffre', /[0-9]/.test(pwForm.next)]].map(([l, ok], i) => <div key={i} className={`flex items-center gap-1 ${ok ? 'text-[var(--success)]' : 'text-[var(--text-muted)]'}`}><CheckCircle className="w-3 h-3" />{l as string}</div>)}</div>}
              </div>
              <div className="space-y-2"><Label>Confirmer</Label><Input type={showPw ? 'text' : 'password'} value={pwForm.confirm} onChange={e => setPwForm({...pwForm, confirm: e.target.value})} /></div>
              <Button onClick={handleChangePw}><Key className="w-4 h-4 mr-2" />Changer le mot de passe</Button>

              <div className="pt-6 border-t border-[var(--border)] grid grid-cols-2 gap-4 text-sm">
                <div className="p-4 rounded-xl bg-[var(--bg-base)]"><p className="text-[var(--text-muted)] text-xs">Auth</p><p className="font-semibold flex items-center gap-1 mt-1"><CheckCircle className="w-4 h-4 text-[var(--success)]" />JWT Bearer</p></div>
                <div className="p-4 rounded-xl bg-[var(--bg-base)]"><p className="text-[var(--text-muted)] text-xs">Expiration</p><p className="font-semibold mt-1">30 min</p></div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {isAdmin && <TabsContent value="company"><Card><CardHeader><CardTitle>Entreprise</CardTitle><CardDescription>ZION PAPER</CardDescription></CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2"><Label>Nom</Label><Input value={companyForm.name} onChange={e => setCompanyForm({...companyForm, name: e.target.value})} /></div>
              <div className="space-y-2"><Label>Email</Label><Input value={companyForm.email} onChange={e => setCompanyForm({...companyForm, email: e.target.value})} /></div>
              <div className="space-y-2"><Label>Téléphone</Label><Input value={companyForm.phone} onChange={e => setCompanyForm({...companyForm, phone: e.target.value})} /></div>
              <div className="space-y-2"><Label>Adresse</Label><Input value={companyForm.address} onChange={e => setCompanyForm({...companyForm, address: e.target.value})} /></div>
            </div>
            <div className="pt-4 border-t border-[var(--border)]"><h4 className="font-semibold mb-3">Catégories</h4>
              <div className="space-y-2 mb-4">{categories.map(c => <div key={c.id} className="flex items-center gap-3 p-3 rounded-xl bg-[var(--bg-base)] border border-[var(--border)]"><div className="w-3 h-3 rounded-full" style={{ background: c.color }} /><span className="font-medium text-sm flex-1">{c.name}</span>{c.description && <span className="text-xs text-[var(--text-muted)]">{c.description}</span>}</div>)}</div>
              <div className="grid grid-cols-3 gap-3">
                <Input value={newCat.name} onChange={e => setNewCat({...newCat, name: e.target.value})} placeholder="Nom" />
                <Input value={newCat.description} onChange={e => setNewCat({...newCat, description: e.target.value})} placeholder="Description" />
                <div className="flex gap-2"><Input type="color" value={newCat.color} onChange={e => setNewCat({...newCat, color: e.target.value})} className="w-12 p-1" /><Button onClick={handleAddCat} disabled={!newCat.name} size="sm">Ajouter</Button></div>
              </div>
            </div>
            <Button onClick={() => toast.success('Enregistré')}><Save className="w-4 h-4 mr-2" />Enregistrer</Button>
          </CardContent></Card></TabsContent>}

        {isAdmin && <TabsContent value="system"><Card><CardHeader><CardTitle>Système</CardTitle></CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-2 gap-4">
              <div className="p-4 rounded-xl border border-[var(--border)]"><h4 className="font-semibold mb-2 text-sm">Alertes</h4><p className="text-xs text-[var(--text-muted)] mb-3">Actualiser les alertes stock</p><Button variant="outline" size="sm" onClick={() => { generateAlerts(); toast.success('Alertes actualisées'); }}><RefreshCw className="w-4 h-4 mr-2" />Actualiser</Button></div>
              <div className="p-4 rounded-xl border border-[var(--border)]"><h4 className="font-semibold mb-2 text-sm">Données</h4><p className="text-xs text-[var(--text-muted)] mb-3">Stockage local actif</p><Badge variant="success">LocalStorage</Badge></div>
            </div>
            <div className="p-4 rounded-xl bg-[var(--bg-base)] border border-[var(--border)]">
              <h4 className="font-semibold mb-3 text-sm">ZION STOCK OS</h4>
              <div className="grid grid-cols-3 gap-3 text-xs">
                {[['Version', '1.1.0'], ['Auth', 'JWT HS256'], ['Frontend', 'React 18'], ['Backend', 'FastAPI'], ['State', 'Zustand'], ['Theme', 'Dark Luxe']].map(([k, v]) => <div key={k}><span className="text-[var(--text-muted)]">{k}:</span> <span className="font-semibold">{v}</span></div>)}
              </div>
            </div>
          </CardContent></Card></TabsContent>}
      </Tabs>
    </div>
  );
};
