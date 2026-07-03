import React, { useState } from 'react';
import { Eye, EyeOff, Lock, Mail, AlertCircle, Loader2 } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { motion } from 'framer-motion';

interface LoginPageProps { onSwitchToRegister?: () => void; }

export const LoginPage: React.FC<LoginPageProps> = ({ onSwitchToRegister }) => {
  const { login, isLoading, error, clearError } = useAuth();
  const [email, setEmail] = useState('admin@zionpaper.cm');
  const [password, setPassword] = useState('Admin123!');
  const [showPw, setShowPw] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => { e.preventDefault(); clearError(); await login(email, password); };

  return (
    <div className="min-h-screen flex">
      {/* Left — Brand */}
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden items-center justify-center bg-gradient-to-br from-[#0A0E13] via-[#11161D] to-[#1a2a4a]">
        <div className="absolute inset-0 opacity-[0.04]" style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg width='40' height='40' viewBox='0 0 40 40' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='%23ffffff' fill-opacity='1'%3E%3Cpath d='M20 20.5V18H0v-2h20v-2l10 3.25L20 20.5z'/%3E%3C/g%3E%3C/svg%3E")` }} />
        <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }} className="text-center z-10 px-12">
          <div className="w-24 h-24 bg-[var(--accent)] rounded-3xl flex items-center justify-center mx-auto mb-8 shadow-2xl shadow-[var(--accent)]/30">
            <span className="text-5xl font-extrabold text-[#0A0E13]">Z</span>
          </div>
          <h1 className="text-4xl font-extrabold text-white tracking-tight">ZION STOCK OS</h1>
          <p className="text-xl text-white/50 mt-3 font-light">Maîtrise ton Stock.</p>
          <div className="mt-12 flex gap-4 justify-center">
            <div className="px-4 py-2 rounded-xl bg-white/5 border border-white/10 text-white/60 text-xs">Multi-Entrepôts</div>
            <div className="px-4 py-2 rounded-xl bg-white/5 border border-white/10 text-white/60 text-xs">Temps Réel</div>
            <div className="px-4 py-2 rounded-xl bg-white/5 border border-white/10 text-white/60 text-xs">JWT Secure</div>
          </div>
        </motion.div>
      </div>

      {/* Right — Form */}
      <div className="flex-1 flex items-center justify-center p-6 bg-[var(--bg-base)]">
        <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.4 }} className="w-full max-w-md">
          {/* Mobile logo */}
          <div className="lg:hidden text-center mb-8">
            <div className="w-16 h-16 bg-[var(--accent)] rounded-2xl flex items-center justify-center mx-auto mb-3 shadow-lg shadow-[var(--accent)]/20">
              <span className="text-3xl font-extrabold text-[#0A0E13]">Z</span>
            </div>
            <h1 className="text-2xl font-bold">ZION STOCK OS</h1>
          </div>

          <div className="glass rounded-2xl p-8">
            <h2 className="text-2xl font-bold mb-1">Connexion</h2>
            <p className="text-sm text-[var(--text-muted)] mb-6">Accédez à votre espace de gestion</p>

            {error && (
              <div className="mb-4 p-3 rounded-xl bg-[var(--danger-muted)] border border-[var(--danger)]/30 flex items-center gap-2 text-[var(--danger)] text-sm">
                <AlertCircle className="w-4 h-4 shrink-0" />{error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label>Email</Label>
                <div className="relative"><Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--text-muted)]" />
                  <Input type="email" value={email} onChange={e => setEmail(e.target.value)} className="pl-10" placeholder="votre@email.com" disabled={isLoading} /></div>
              </div>
              <div className="space-y-2">
                <Label>Mot de passe</Label>
                <div className="relative"><Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--text-muted)]" />
                  <Input type={showPw ? 'text' : 'password'} value={password} onChange={e => setPassword(e.target.value)} className="pl-10 pr-10" disabled={isLoading} />
                  <button type="button" onClick={() => setShowPw(!showPw)} className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)] hover:text-[var(--text-primary)]">{showPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}</button>
                </div>
              </div>
              <Button type="submit" variant="accent" className="w-full" disabled={isLoading}>
                {isLoading ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Connexion…</> : 'Se connecter'}
              </Button>
            </form>

            <div className="mt-6 p-4 rounded-xl bg-[var(--bg-base)] border border-[var(--border)]">
              <p className="text-[10px] font-bold text-[var(--text-muted)] uppercase tracking-wider mb-2">Comptes Démo</p>
              <div className="space-y-1 text-xs text-[var(--text-muted)]">
                <p><span className="text-[var(--text-primary)] font-medium">Admin:</span> admin@zionpaper.cm / Admin123!</p>
                <p><span className="text-[var(--text-primary)] font-medium">Magasinier:</span> magasinier@zionpaper.cm / Magasin123!</p>
                <p><span className="text-[var(--text-primary)] font-medium">Vendeur:</span> vendeur@zionpaper.cm / Vendeur123!</p>
              </div>
            </div>

            {onSwitchToRegister && (
              <p className="text-center text-sm text-[var(--text-muted)] mt-4">Pas de compte ? <button type="button" onClick={onSwitchToRegister} className="text-[var(--primary)] font-medium hover:underline">Créer un compte</button></p>
            )}
          </div>
          <p className="text-center text-[10px] text-[var(--text-muted)] mt-4">ZION PAPER © 2024 — v1.1 JWT Auth</p>
        </motion.div>
      </div>
    </div>
  );
};
