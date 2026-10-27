import React, { useState } from 'react';
import { auth, db } from '../services/firebase';
import { 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  signInWithPopup, 
  GoogleAuthProvider 
} from 'firebase/auth';
import { doc, setDoc, getDoc, serverTimestamp } from 'firebase/firestore';

export default function AuthModal({ onLoginSuccess }) {
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [nome, setNome] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [loading, setLoading] = useState(false);

  const criarPerfilSeNecessario = async (user, nomePadrao) => {
    const userDocRef = doc(db, 'usuarios', user.uid);
    const snap = await getDoc(userDocRef);
    if (!snap.exists()) {
      await setDoc(userDocRef, {
        nome: nomePadrao || user.displayName || 'Estudante',
        email: user.email,
        nivel: 1,
        xp: 0,
        nextLevelXp: 100,
        revisoesConcluidas: 0,
        criado_em: serverTimestamp()
      });
    }
  };

  const handleEmailAuth = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    setLoading(true);

    try {
      if (isSignUp) {
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        await criarPerfilSeNecessario(userCredential.user, nome);
        onLoginSuccess(userCredential.user);
      } else {
        const userCredential = await signInWithEmailAndPassword(auth, email, password);
        onLoginSuccess(userCredential.user);
      }
    } catch (err) {
      console.error(err);
      setErrorMsg('Falha na autenticação. Verifique o seu e-mail e palavra-passe.');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleAuth = async () => {
    setErrorMsg('');
    setLoading(true);
    const provider = new GoogleAuthProvider();

    try {
      const result = await signInWithPopup(auth, provider);
      await criarPerfilSeNecessario(result.user);
      onLoginSuccess(result.user);
    } catch (err) {
      console.error(err);
      setErrorMsg('Falha ao autenticar com a conta Google.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-slate-950 flex items-center justify-center p-4 z-50">
      <div className="bg-slate-900 border border-slate-800 p-8 rounded-3xl max-w-sm w-full space-y-6 shadow-2xl">
        <div className="text-center space-y-2">
          {/* LOGO DA APLICAÇÃO */}
          <img 
            src="/logo.png" 
            alt="OrgaLearn Logo" 
            className="h-20 w-20 object-contain mx-auto mb-3 drop-shadow-lg"
          />
          <h2 className="text-2xl font-black tracking-tight text-slate-100">OrgaLearn</h2>
          <p className="text-xs text-slate-400">
            {isSignUp 
              ? 'Crie a sua conta para iniciar o ciclo de estudos' 
              : 'Entre para continuar o seu progresso no SM-2'}
          </p>
        </div>

        {errorMsg && (
          <div className="bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs p-3 rounded-xl text-center">
            {errorMsg}
          </div>
        )}

        <form onSubmit={handleEmailAuth} className="space-y-3">
          {isSignUp && (
            <div>
              <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1">Nome</label>
              <input
                type="text"
                required
                value={nome}
                onChange={(e) => setNome(e.target.value)}
                placeholder="Seu nome completo"
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-sm text-slate-100 focus:outline-none focus:border-amber-400"
              />
            </div>
          )}

          <div>
            <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1">E-mail</label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="seu@email.com"
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-sm text-slate-100 focus:outline-none focus:border-amber-400"
            />
          </div>

          <div>
            <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1">Palavra-passe</label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-sm text-slate-100 focus:outline-none focus:border-amber-400"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold py-2.5 rounded-xl transition text-sm mt-2 disabled:opacity-50"
          >
            {loading ? 'A processar...' : isSignUp ? 'Criar conta' : 'Entrar'}
          </button>
        </form>

        <div className="relative flex items-center justify-center">
          <div className="border-t border-slate-800 w-full" />
          <span className="bg-slate-900 px-2 text-[10px] text-slate-500 uppercase tracking-widest font-bold">ou</span>
          <div className="border-t border-slate-800 w-full" />
        </div>

        <button
          onClick={handleGoogleAuth}
          disabled={loading}
          type="button"
          className="w-full bg-slate-950 hover:bg-slate-800 border border-slate-800 text-slate-200 font-semibold py-2.5 rounded-xl transition text-xs flex items-center justify-center space-x-2"
        >
          <span>Continuar com Google</span>
        </button>

        <div className="text-center pt-2">
          <button
            type="button"
            onClick={() => setIsSignUp(!isSignUp)}
            className="text-xs text-amber-400 hover:underline font-semibold"
          >
            {isSignUp ? 'Já tem uma conta? Inicie sessão' : 'Não tem conta? Registe-se agora'}
          </button>
        </div>
      </div>
    </div>
  );
}