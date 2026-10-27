import React from 'react';
import { 
  Clock, 
  BookOpen, 
  BarChart2, 
  Award, 
  LogOut 
} from 'lucide-react';
import { auth } from '../services/firebase';
import { signOut } from 'firebase/auth';

export default function Sidebar({ activeTab, setActiveTab, userStats, pendingReviewsCount = 0 }) {
  const handleLogout = async () => {
    try {
      await signOut(auth);
    } catch (error) {
      console.error('Erro ao sair:', error);
    }
  };

  const menuItems = [
    { id: 'timer', label: 'Estudo Ativo', icon: Clock },
    { id: 'revisoes', label: 'Fila de Revisões', icon: BookOpen, badge: pendingReviewsCount },
    { id: 'dashboard', label: 'Dashboard', icon: BarChart2 },
    { id: 'metricas', label: 'Métricas & Análise', icon: Award },
  ];

  const progressoNivel = Math.min(
    Math.round(((userStats.xp || 0) / (userStats.nextLevelXp || 100)) * 100),
    100
  );

  return (
    <aside className="w-64 bg-slate-950 border-r border-slate-800 flex flex-col justify-between p-4 select-none">
      <div className="space-y-6">
        {/* LOGO E NOME DA APLICAÇÃO */}
        <div className="flex items-center space-x-3 px-2">
          <img 
            src="/logo.png" 
            alt="OrgaLearn Logo" 
            className="h-14 w-14 object-contain rounded-2xl drop-shadow-md"
          />
          <div>
            <h1 className="font-extrabold text-xl tracking-tight text-slate-100">OrgaLearn</h1>
            <p className="text-[10px] text-amber-400 font-semibold uppercase tracking-wider">Repetição Espaçada</p>
          </div>
        </div>

        {/* NAVEGAÇÃO */}
        <nav className="space-y-1">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl font-medium text-sm transition ${
                  isActive
                    ? 'bg-amber-500/10 text-amber-400 border border-amber-500/30'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
                }`}
              >
                <div className="flex items-center space-x-3">
                  <Icon className="h-4 w-4" />
                  <span>{item.label}</span>
                </div>
                {item.badge > 0 && (
                  <span className="bg-amber-500 text-slate-950 text-xs font-bold px-2 py-0.5 rounded-full">
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>
      </div>

      {/* GAMIFICAÇÃO & PERFIL DO UTILIZADOR */}
      <div className="space-y-4 pt-4 border-t border-slate-800/80">
        <div className="bg-slate-900/80 border border-slate-800 p-3 rounded-2xl space-y-2">
          <div className="flex justify-between items-center text-xs">
            <span className="font-bold text-slate-200">{userStats.nome || 'Estudante'}</span>
            <span className="text-amber-400 font-bold font-mono">Nv. {userStats.nivel || 1}</span>
          </div>

          <div className="w-full bg-slate-800 rounded-full h-1.5 overflow-hidden">
            <div 
              className="bg-amber-400 h-1.5 rounded-full transition-all duration-300"
              style={{ width: `${progressoNivel}%` }}
            />
          </div>

          <div className="flex justify-between items-center text-[10px] text-slate-400 font-mono">
            <span>{userStats.xp || 0} XP</span>
            <span>{userStats.nextLevelXp || 100} XP</span>
          </div>
        </div>

        <button
          onClick={handleLogout}
          className="w-full flex items-center space-x-3 px-3 py-2 rounded-xl text-xs font-semibold text-rose-400 hover:bg-rose-500/10 transition"
        >
          <LogOut className="h-4 w-4" />
          <span>Encerrar sessão</span>
        </button>
      </div>
    </aside>
  );
}