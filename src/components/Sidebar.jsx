import { Clock, BookOpen, RotateCcw, LayoutDashboard, BarChart2, LogOut } from 'lucide-react';

export default function Sidebar({ 
  activeTab, 
  setActiveTab, 
  userStats = {}, 
  pendingReviewsCount = 0,
  onLogout 
}) {
  const menuItems = [
    { id: 'timer', label: 'Estudo Ativo', icon: Clock },
    { id: 'conteudos', label: 'Conteúdos Estudados', icon: BookOpen },
    { 
      id: 'revisoes', 
      label: 'Fila de Revisões', 
      icon: RotateCcw, 
      badge: pendingReviewsCount > 0 ? pendingReviewsCount : null 
    },
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'metricas', label: 'Métricas & Análise', icon: BarChart2 },
  ];

  // Regra de 1000 XP por nível
  const nivel = userStats?.nivel || 1;
  const xpTotal = userStats?.xp || 0;
  const xpNoNivel = xpTotal % 1000;
  const xpNecessario = 1000;
  const progressoPercent = Math.min(100, Math.round((xpNoNivel / xpNecessario) * 100));

  return (
    <aside className="w-64 bg-slate-950 border-r border-slate-800/80 flex flex-col justify-between shrink-0 select-none">
      <div className="p-6 space-y-8">
        {/* Logótipo */}
        <div className="flex items-center space-x-3">
          <div className="h-10 w-10 rounded-2xl overflow-hidden flex items-center justify-center bg-transparent shrink-0">
            <img 
              src="/logo.png" 
              alt="OrgaLearn Logo" 
              className="h-full w-full object-contain" 
            />
          </div>
          <div>
            <h1 className="text-lg font-black tracking-tight text-slate-100">OrgaLearn</h1>
            <p className="text-[10px] text-amber-400 font-bold uppercase tracking-wider">Repetição Espaçada</p>
          </div>
        </div>

        {/* Menu de Navegação */}
        <nav className="space-y-1.5">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`w-full flex items-center justify-between px-4 py-3 rounded-2xl text-xs font-bold transition cursor-pointer ${
                  isActive
                    ? 'bg-amber-500 text-slate-950 shadow-lg shadow-amber-500/10'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/60'
                }`}
              >
                <div className="flex items-center space-x-3">
                  <Icon className={`h-4 w-4 ${isActive ? 'text-slate-950' : 'text-slate-400'}`} />
                  <span>{item.label}</span>
                </div>
                {item.badge && (
                  <span className={`px-2 py-0.5 rounded-full text-[10px] font-extrabold ${
                    isActive ? 'bg-slate-950 text-amber-400' : 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                  }`}>
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Perfil e Progresso do Utilizador na Base da Sidebar */}
      <div className="p-4 m-4 bg-slate-900/80 border border-slate-800 rounded-2xl space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold text-slate-200 truncate max-w-[120px]">
            {userStats?.nome || 'Estudante'}
          </span>
          <span className="text-xs font-extrabold text-amber-400">
            Nv. {nivel}
          </span>
        </div>

        {/* Barra de Progresso do XP */}
        <div className="space-y-1">
          <div className="w-full bg-slate-950 h-2 rounded-full overflow-hidden border border-slate-800">
            <div
              className="bg-amber-500 h-full rounded-full transition-all duration-500"
              style={{ width: `${progressoPercent}%` }}
            />
          </div>
          <div className="flex justify-between text-[10px] font-mono text-slate-400">
            <span>{xpNoNivel} XP</span>
            <span>{xpNecessario} XP</span>
          </div>
        </div>

        <button
          type="button"
          onClick={onLogout}
          className="w-full pt-2 border-t border-slate-800/80 flex items-center justify-center space-x-1.5 text-xs text-rose-400 hover:text-rose-300 font-semibold transition cursor-pointer"
        >
          <LogOut className="h-3.5 w-3.5" />
          <span>Encerrar sessão</span>
        </button>
      </div>
    </aside>
  );
}