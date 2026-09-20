import React from 'react';
import { Clock, BookOpen, BarChart2, Award, Sparkles, LogOut } from 'lucide-react';
import { auth } from '../services/firebase';
import { signOut } from 'firebase/auth';

export default function Sidebar({ activeTab, setActiveTab, userStats, pendingReviewsCount }) {
  const handleLogout = () => {
    signOut(auth);
  };

  const iniciais = userStats.nome 
    ? userStats.nome.substring(0, 2).toUpperCase() 
    : 'OL';

  return (
    <aside className="w-64 bg-slate-950 border-r border-slate-800 flex flex-col justify-between">
      <div>
        <div className="p-6 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-amber-500 rounded-lg text-slate-950 font-bold">
              <Sparkles className="h-6 w-6" />
            </div>
            <div>
              <h1 className="font-bold text-lg text-amber-400">OrgaLearn</h1>
              <p className="text-xs text-slate-400">LMS & Repetição Espaçada</p>
            </div>
          </div>
        </div>

        <nav className="p-4 space-y-2">
          <button
            onClick={() => setActiveTab('timer')}
            className={`w-full flex items-center space-x-3 px-4 py-3 rounded-xl transition ${
              activeTab === 'timer'
                ? 'bg-amber-500/10 text-amber-400 border border-amber-500/30'
                : 'text-slate-400 hover:bg-slate-800/50'
            }`}
          >
            <Clock className="h-5 w-5" />
            <span>Sessão de Estudo</span>
          </button>

          <button
            onClick={() => setActiveTab('revisoes')}
            className={`w-full flex items-center space-x-3 px-4 py-3 rounded-xl transition ${
              activeTab === 'revisoes'
                ? 'bg-amber-500/10 text-amber-400 border border-amber-500/30'
                : 'text-slate-400 hover:bg-slate-800/50'
            }`}
          >
            <BookOpen className="h-5 w-5" />
            <span>Fila de Revisões</span>
            <span className="ml-auto bg-amber-500/20 text-amber-400 text-xs px-2 py-0.5 rounded-full border border-amber-500/30">
              {pendingReviewsCount}
            </span>
          </button>

          <button
            onClick={() => setActiveTab('dashboard')}
            className={`w-full flex items-center space-x-3 px-4 py-3 rounded-xl transition ${
              activeTab === 'dashboard'
                ? 'bg-amber-500/10 text-amber-400 border border-amber-500/30'
                : 'text-slate-400 hover:bg-slate-800/50'
            }`}
          >
            <Award className="h-5 w-5" />
            <span>Dashboard</span>
          </button>

          <button
            onClick={() => setActiveTab('metricas')}
            className={`w-full flex items-center space-x-3 px-4 py-3 rounded-xl transition ${
              activeTab === 'metricas'
                ? 'bg-amber-500/10 text-amber-400 border border-amber-500/30'
                : 'text-slate-400 hover:bg-slate-800/50'
            }`}
          >
            <BarChart2 className="h-5 w-5" />
            <span>Métricas</span>
          </button>
        </nav>
      </div>

      {/* PERFIL DO USUÁRIO */}
      <div className="p-4 border-t border-slate-800 bg-slate-900/50 space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-full bg-purple-900/60 text-purple-300 border border-purple-500/30 flex items-center justify-center font-bold text-sm">
              {iniciais}
            </div>
            <div>
              <p className="text-sm font-semibold text-slate-200">{userStats.nome}</p>
              <p className="text-xs text-amber-400 font-medium">Nível {userStats.nivel}</p>
            </div>
          </div>
          <button
            onClick={handleLogout}
            title="Sair da conta"
            className="p-2 text-slate-500 hover:text-rose-400 hover:bg-rose-500/10 rounded-lg transition"
          >
            <LogOut className="h-4 w-4" />
          </button>
        </div>

        <div className="space-y-1">
          <div className="flex justify-between text-xs text-slate-400">
            <span>Progresso</span>
            <span>{userStats.xp} / {userStats.nextLevelXp} XP</span>
          </div>
          <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
            <div
              className="bg-amber-500 h-full rounded-full transition-all duration-300"
              style={{ width: `${Math.min(100, (userStats.xp / userStats.nextLevelXp) * 100)}%` }}
            ></div>
          </div>
          <p className="text-[10px] text-slate-500 text-right pt-0.5">
            Faltam {Math.max(0, userStats.nextLevelXp - userStats.xp)} XP para o nível {userStats.nivel + 1}
          </p>
        </div>
      </div>
    </aside>
  );
}