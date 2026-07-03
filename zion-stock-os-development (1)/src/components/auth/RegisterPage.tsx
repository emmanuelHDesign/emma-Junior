import React, { useState } from 'react';
import { Eye, EyeOff, Lock, Mail, User, Building2, AlertCircle, Loader2, CheckCircle } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import { validatePassword, validateEmail } from '../../lib/auth';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { motion } from 'framer-motion';

interface RegisterPageProps { onSwitchToLogin: () => void; }

export const RegisterPage: React.FC<RegisterPageProps> = ({ onSwitchToLogin }) => {
  const { register, isLoading, error, clearError } = useAuth();
  const [form, setForm] = useState({ email: '', password: '', confirmPassword: '', fullName: '', companyName: '' });
  const [showPw, setShowPw] = useState(false);
  const [localError, setLocalError] = useState<string | null>(null);

  const pwValid = validatePassword(form.password);
  const pwMatch = form.password === form.confirmPassword;
  const emailOk = form.email ? validateEmail(form.email) : true;

  const handle = (e: React.ChangeEvent<HTMLInputElement>) => { setForm(p => ({ ...p, [e.target.name]: e.target.value })); setLocalError(null); clearError(); };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault(); setLocalError(null); clearError();
    if (!form.email || !form.password || !form.fullName) { setLocalError('Remplissez tous les champs obligatoires'); return; }
    if (!emailOk) { setLocalError('Email invalide'); return; }
    if (!pwValid.valid) { setLocalError(pwValid.message); return; }
    if (!pwMatch) { setLocalError('Les mots de passe ne correspondent pas'); return; }
    await register(form.email, form.password, form.fullName, form.companyName || undefined);
  };

  const err = localError || error;

  return (
    <div className="min-h-screen flex items-center justify-center p-6 bg-[var(--bg-base)]">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="w-full max-w-md">
        <div className="text-center mb-6">
          <div className="w-16 h-16 bg-[var(--accent)] rounded-2xl flex items-center justify-center mx-auto mb-3 shadow-lg shadow-[var(--accent)]/20"><span className="text-3xl font-extrabold text-[#0A0E13]">Z</span></div>
          <h1 className="text-2xl font-bold">Créer un compte</h1>
        </div>
        <div className="glass rounded-2xl p-8">
          {err && <div className="mb-4 p-3 rounded-xl bg-[var(--danger-muted)] border border-[var(--danger)]/30 flex items-center gap-2 text-[var(--danger)] text-sm"><AlertCircle className="w-4 h-4 shrink-0" />{err}</div>}
          <form onSubmit={submit} className="space-y-4">
            <div className="space-y-2"><Label>Nom complet *</Label><div className="relative"><User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--text-muted)]" /><Input name="fullName" value={form.fullName} onChange={handle} className="pl-10" placeholder="Jean Dupont" disabled={isLoading} /></div></div>
            <div className="space-y-2"><Label>Email *</Label><div className="relative"><Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--text-muted)]" /><Input name="email" type="email" value={form.email} onChange={handle} className="pl-10" disabled={isLoading} /></div></div>
            <div className="space-y-2"><Label>Entreprise</Label><div className="relative"><Building2 className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--text-muted)]" /><Input name="companyName" value={form.companyName} onChange={handle} className="pl-10" placeholder="Optionnel" disabled={isLoading} /></div></div>
            <div className="space-y-2"><Label>Mot de passe *</Label><div className="relative"><Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--text-muted)]" /><Input name="password" type={showPw ? 'text' : 'password'} value={form.password} onChange={handle} className="pl-10 pr-10" disabled={isLoading} /><button type="button" onClick={() => setShowPw(!showPw)} className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)]">{showPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}</button></div>
              {form.password && <div className="text-xs space-y-0.5 mt-1">{[['8 caractères', form.password.length >= 8], ['Majuscule', /[A-Z]/.test(form.password)], ['Minuscule', /[a-z]/.test(form.password)], ['Chiffre', /[0-9]/.test(form.password)]].map(([l, ok], i) => <div key={i} className={`flex items-center gap-1 ${ok ? 'text-[var(--success)]' : 'text-[var(--text-muted)]'}`}><CheckCircle className="w-3 h-3" /><span>{l as string}</span></div>)}</div>}
            </div>
            <div className="space-y-2"><Label>Confirmer *</Label><Input name="confirmPassword" type={showPw ? 'text' : 'password'} value={form.confirmPassword} onChange={handle} disabled={isLoading} />{form.confirmPassword && !pwMatch && <p className="text-xs text-[var(--danger)]">Non identiques</p>}</div>
            <Button type="submit" variant="accent" className="w-full" disabled={isLoading || !pwValid.valid || !pwMatch}>{isLoading ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Création…</> : 'Créer mon compte'}</Button>
          </form>
          <p className="text-center text-sm text-[var(--text-muted)] mt-4">Déjà un compte ? <button type="button" onClick={onSwitchToLogin} className="text-[var(--primary)] font-medium hover:underline">Se connecter</button></p>
        </div>
      </motion.div>
    </div>
  );
};
