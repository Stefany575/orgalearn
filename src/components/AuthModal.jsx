import React, { useState } from 'react';
import { auth, db } from '../services/firebase';
import { 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword,
  updateProfile 
} from 'firebase/auth';
import { doc, setDoc, serverTimestamp } from 'firebase/firestore';
import { Sparkles, LogIn, UserPlus } from 'lucide-react';

export default function AuthModal({ onLoginSuccess }) {
  const [isRegistering, setIsRegistering] = useState(false);
  const [nome, setNome] = useState('');
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [erro, setErro] = useState('');
  const [carregando, setCarregando] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErro('');
    setCarregando(true);

    try {
      if (isRegistering) {
        // Criar usuário no Firebase Auth
        const credenciais = await createUserWithEmailAndPassword(auth, email, senha);
        const user = credenciais.user;

        // Atualizar display name
        await updateProfile(user, { displayName: nome });

        // Criar documento do usuário no Firestore (coleção 'usuarios')
        await setDoc(doc(db, 'usuarios', user.uid), {
          uid: user.uid,
          nome: nome || 'Estudante',
          email: user.email,
          nivel: 1,
          xp: 0,
          nextLevelXp: 100,
          criado_em: serverTimestamp()
        });

        onLoginSuccess(user);
      } else {
        // Login com Firebase Auth
        const credenciais = await signInWithEmailAndPassword(auth, email, senha);
        onLoginSuccess(credenciais.user);
      }
    } catch (err) {
      console.error(err);
      if (err.code === 'auth/email-already-in-use') {
        setErro('Este e-mail já está cadastrado.');
      } else if (err.code === 'auth/wrong-password' || err.code === 'auth/invalid-credential') {
        setErro('E-mail ou senha inválidos.');
      } else if (err.code === 'auth/weak-password') {
        setErro('A senha deve ter pelo menos 6 caracteres.');
      } else {
        setErro('Ocorreu um erro ao processar. Tente novamente.');
      }
    } finally {
      setCarregando(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-slate-950/90 backdrop-blur-md flex items-center justify-center p-4 z-50">
      <div className="bg-slate-900 border border-slate-800 p-8 rounded-3xl max-w-md w-full shadow-2xl space-y-6">
        <div className="text-center space-y-2">
          <div className="inline-flex p-3 bg-amber-500/10 border border-amber-500/30 rounded-2xl text-amber-400 mb-2">
            <Sparkles className="h-8 w-8" />
          </div>
          <h2 className="text-2xl font-bold text-slate-100">
            {isRegistering ? 'Criar sua conta' : 'Entrar no OrgaLearn'}
          </h2>
          <p className="text-xs text-slate-400">
            Gestão de tempo de estudo e repetição espaçada personalizada.
          </p>
        </div>

        {erro && (
          <div className="p-3 bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs rounded-xl text-center">
            {erro}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {isRegistering && (
            <div>
              <label className="text-xs text-slate-400 block mb-1 font-medium">Seu Nome</label>
              <input
                type="text"
                required
                value={nome}
                onChange={(e) => setNome(e.target.value)}
                placeholder="Ex: Stefany"
                className="w-full bg-slate-950 border border-slate-800 p-3 rounded-xl text-slate-100 text-sm focus:outline-none focus:border-amber-500"
              />
            </div>
          )}

          <div>
            <label className="text-xs text-slate-400 block mb-1 font-medium">E-mail</label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="seuemail@exemplo.com"
              className="w-full bg-slate-950 border border-slate-800 p-3 rounded-xl text-slate-100 text-sm focus:outline-none focus:border-amber-500"
            />
          </div>

          <div>
            <label className="text-xs text-slate-400 block mb-1 font-medium">Senha</label>
            <input
              type="password"
              required
              value={senha}
              onChange={(e) => setSenha(e.target.value)}
              placeholder="Mínimo 6 caracteres"
              className="w-full bg-slate-950 border border-slate-800 p-3 rounded-xl text-slate-100 text-sm focus:outline-none focus:border-amber-500"
            />
          </div>

          <button
            type="submit"
            disabled={carregando}
            className="w-full py-3 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold rounded-xl text-sm transition flex items-center justify-center space-x-2 disabled:opacity-50"
          >
            {isRegistering ? <UserPlus className="h-4 w-4" /> : <LogIn className="h-4 w-4" />}
            <span>{carregando ? 'Aguarde...' : isRegistering ? 'Cadastrar' : 'Entrar'}</span>
          </button>
        </form>

        <div className="text-center pt-2 border-t border-slate-800">
          <button
            type="button"
            onClick={() => { setIsRegistering(!isRegistering); setErro(''); }}
            className="text-xs text-slate-400 hover:text-amber-400 transition"
          >
            {isRegistering
              ? 'Já tem uma conta? Clique para entrar'
              : 'Não tem conta? Cadastre-se gratuitamente'}
          </button>
        </div>
      </div>
    </div>
  );
}