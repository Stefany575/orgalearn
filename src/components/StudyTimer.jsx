import { useState, useMemo } from 'react';
import { Play, Pause, RotateCcw, Check, Plus, Folder, Trash2, Flame } from 'lucide-react';

export default function StudyTimer({
  selectedMateria,
  setSelectedMateria,
  materias = [],
  handleAddNewMateria,
  handleDeleteMateria,
  seconds = 0,
  isActive = false,
  toggleTimer,
  resetTimer,
  formatTime,
  onOpenEvaluation,
  userStats = {},
  revisoes = []
}) {

  //Estados Locais e Funções de Matéria
  const [isAdding, setIsAdding] = useState(false);
  const [novaMateria, setNovaMateria] = useState('');

  const submitNovaMateria = (e) => {
    e.preventDefault();
    if (!novaMateria.trim()) return;
    handleAddNewMateria(novaMateria.trim());
    setNovaMateria('');
    setIsAdding(false);
  };

  //Cálcuos de Gamificação
  const streakDias = userStats?.diasOfensiva || 0;

  // Gamificação baseada em blocos de 1000 XP por Nível
  const nivel = userStats?.nivel || 1;
  const xpTotal = userStats?.xp || 0;
  const xpNoNivel = xpTotal % 1000;
  const xpNecessario = 1000;
  const progressoPercent = Math.min(100, Math.round((xpNoNivel / xpNecessario) * 100));
  const xpRestante = xpNecessario - xpNoNivel;

  // Próximas revisões na fila
  const proximasRevisoes = useMemo(() => {
    const hoje = new Date();
    hoje.setHours(0, 0, 0, 0);

    if (!Array.isArray(revisoes)) return [];

    return [...revisoes]
      .filter((r) => r && r.dataVencimento)
      .map((r) => {
        let dataVenc = new Date(r.dataVencimento + 'T00:00:00');
        const diffTempo = dataVenc - hoje;
        const diffDias = Math.ceil(diffTempo / (1000 * 60 * 60 * 24));

        let badgeTexto = 'hoje';
        let badgeEstilo = 'bg-amber-500/10 border-amber-500/40 text-amber-400';

        if (isNaN(diffDias) || diffDias <= 0) {
          badgeTexto = 'hoje';
          badgeEstilo = 'bg-amber-500/10 border-amber-500/40 text-amber-400';
        } else if (diffDias === 1) {
          badgeTexto = 'amanhã';
          badgeEstilo = 'bg-purple-500/10 border-purple-500/40 text-purple-300';
        } else {
          badgeTexto = `em ${diffDias} dias`;
          badgeEstilo = 'bg-purple-500/10 border-purple-500/40 text-purple-300';
        }

        return {
          id: r.id || Math.random(),
          titulo: r.topico || r.conteudoEspecifico || r.materia || 'Conteúdo de Estudo',
          diffDias: isNaN(diffDias) ? 0 : diffDias,
          badgeTexto,
          badgeEstilo
        };
      })
      .sort((a, b) => a.diffDias - b.diffDias)
      .slice(0, 3);
  }, [revisoes]);

  //Interface da Tela
  return (
    <div className="max-w-xl mx-auto space-y-6">
      {/* Cabeçalho com o contador de Ofensiva */}
      <div className="relative text-center space-y-2">
        <div className="flex justify-end mb-2 sm:mb-0 sm:absolute sm:right-0 sm:top-0">
          <div className="inline-flex items-center space-x-1.5 px-3.5 py-1.5 rounded-full border border-emerald-500/40 bg-emerald-950/20 text-emerald-400 text-xs font-bold shadow-sm">
            <Flame className="h-4 w-4 fill-emerald-400 text-emerald-400" />
            <span>{streakDias} {streakDias === 1 ? 'dia seguido' : 'dias seguidos'}</span>
          </div>
        </div>

        <h2 className="text-3xl font-extrabold text-slate-100">Sessão de Estudo</h2>
        <p className="text-slate-400 text-sm">
          Selecione a matéria principal e inicie o cronômetro para acompanhar seu foco.
        </p>
      </div>

      {/* Seleção da Matéria */}
      <div className="bg-slate-800/80 border border-slate-700/60 p-5 rounded-2xl space-y-3 shadow-lg">
        <div className="flex items-center justify-between">
          <label className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center space-x-2">
            <Folder className="h-4 w-4 text-amber-400" />
            <span>Matéria Principal</span>
          </label>

          {!isAdding && (
            <div className="flex items-center space-x-2">
              {selectedMateria && (
                <button
                  type="button"
                  onClick={() => handleDeleteMateria(selectedMateria)}
                  title="Excluir matéria selecionada"
                  className="text-xs text-rose-400 hover:text-rose-300 font-semibold transition flex items-center space-x-1 p-1 hover:bg-rose-500/10 rounded-lg cursor-pointer"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                  <span>Excluir</span>
                </button>
              )}
              <button
                type="button"
                onClick={() => setIsAdding(true)}
                className="text-xs text-amber-400 hover:text-amber-300 font-semibold transition flex items-center space-x-1 cursor-pointer"
              >
                <Plus className="h-3.5 w-3.5" />
                <span>Nova Matéria</span>
              </button>
            </div>
          )}
        </div>

        {/* Alterna entre o Formulário (input) e a Lista de Seleção (select) */}
        {isAdding ? (
          <form onSubmit={submitNovaMateria} className="flex space-x-2">
            <input
              type="text"
              autoFocus
              required
              value={novaMateria}
              onChange={(e) => setNovaMateria(e.target.value)}
              placeholder="Ex: Engenharia de Software, Cálculo..."
              className="flex-1 bg-slate-950 border border-slate-700 rounded-xl px-4 py-2 text-sm text-slate-100 focus:outline-none focus:border-amber-400"
            />
            <button
              type="submit"
              className="bg-amber-500 hover:bg-amber-400 text-slate-950 px-4 py-2 rounded-xl text-xs font-bold transition cursor-pointer"
            >
              Adicionar
            </button>
            <button
              type="button"
              onClick={() => {
                setIsAdding(false);
                setNovaMateria('');
              }}
              className="bg-slate-900 hover:bg-slate-700 text-slate-400 px-3 py-2 rounded-xl text-xs transition cursor-pointer"
            >
              Cancelar
            </button>
          </form>
        ) : (
          <select
            value={selectedMateria}
            onChange={(e) => setSelectedMateria(e.target.value)}
            className="w-full bg-slate-950 border border-slate-700/80 rounded-xl px-4 py-3 text-sm text-slate-200 focus:outline-none focus:border-amber-400 font-medium"
          >
            {materias.length === 0 ? (
              <option value="">Nenhuma matéria cadastrada (clique em "Nova Matéria")</option>
            ) : (
              materias.map((materia) => (
                <option key={materia} value={materia}>
                  {materia}
                </option>
              ))
            )}
          </select>
        )}
      </div>

      {/* Painel do Cronômetro */}
      <div className="bg-slate-800/80 border border-slate-700/60 p-8 rounded-3xl text-center space-y-6 shadow-xl">
        <div className="text-6xl sm:text-7xl font-extrabold font-mono tracking-tight text-slate-100">
          {typeof formatTime === 'function' ? formatTime(seconds) : seconds}
        </div>

        <div className="flex items-center justify-center space-x-4">
          <button
            onClick={toggleTimer}
            disabled={!selectedMateria}
            className={`px-6 py-3 rounded-2xl font-bold text-sm transition flex items-center space-x-2 shadow-lg cursor-pointer ${
              isActive
                ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40 hover:bg-amber-500/30'
                : 'bg-amber-500 text-slate-950 hover:bg-amber-400 disabled:opacity-40'
            }`}
          >
            {isActive ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
            <span>{isActive ? 'Pausar' : 'Iniciar Foco'}</span>
          </button>

          <button
            onClick={resetTimer}
            disabled={seconds === 0}
            className="p-3 bg-slate-900 hover:bg-slate-700 text-slate-400 hover:text-slate-200 border border-slate-700 rounded-2xl transition disabled:opacity-30 cursor-pointer"
            title="Reiniciar cronômetro"
          >
            <RotateCcw className="h-4 w-4" />
          </button>

          <button
            onClick={onOpenEvaluation}
            disabled={!selectedMateria || seconds < 10}
            className="px-5 py-3 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-sm rounded-2xl transition flex items-center space-x-2 disabled:opacity-40 shadow-lg shadow-emerald-500/10 cursor-pointer"
            title="Concluir sessão e especificar o conteúdo estudado"
          >
            <Check className="h-4 w-4" />
            <span>Concluir</span>
          </button>
        </div>
      </div>

      {/* CARTÃO "SEU PROGRESSO"  (LOGO ABAIXO DO CRONÔMETRO) */}
      <div className="bg-slate-800/80 border border-slate-700/60 p-6 rounded-3xl space-y-4 shadow-xl">
        <div className="space-y-3">
          <h3 className="font-bold text-slate-100 text-base">Seu progresso</h3>
          <div className="flex items-baseline justify-between pt-1">
            <span className="text-xl font-extrabold text-slate-100">Nível {nivel}</span>
            <span className="text-xs font-mono text-slate-400 font-medium">
              {xpNoNivel} / {xpNecessario} XP
            </span>
          </div>
          <div className="w-full bg-slate-950 h-2.5 rounded-full overflow-hidden border border-slate-700/40">
            <div
              className="bg-amber-500 h-full rounded-full transition-all duration-500"
              style={{ width: `${progressoPercent}%` }}
            />
          </div>
        </div>
        <p className="text-xs text-slate-400 pt-1">
          Faltam {xpRestante} XP para o nível {nivel + 1}.
        </p>
      </div>

      {/* Próximas na fila */}
      <div className="bg-slate-800/80 border border-slate-700/60 p-6 rounded-3xl space-y-4 shadow-xl">
        <h3 className="font-bold text-slate-100 text-base">Próximas na fila</h3>
        <div className="space-y-3">
          {proximasRevisoes.length === 0 ? (
            <p className="text-xs text-slate-500 py-4 text-center">Nenhuma revisão pendente na fila.</p>
          ) : (
            proximasRevisoes.map((item) => (
              <div
                key={item.id}
                className="bg-slate-900/90 border border-slate-700/50 px-4 py-3 rounded-xl flex items-center justify-between text-sm"
              >
                <span className="font-medium text-slate-200 truncate pr-3">{item.titulo}</span>
                <span className={`text-[11px] font-semibold px-2.5 py-0.5 rounded-full border shrink-0 ${item.badgeEstilo}`}>
                  {item.badgeTexto}
                </span>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}