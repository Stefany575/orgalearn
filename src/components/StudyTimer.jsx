import React, { useState } from 'react';
import { Play, Pause, RotateCcw, Check, Plus, Folder, Trash2 } from 'lucide-react';

export default function StudyTimer({
  selectedMateria,
  setSelectedMateria,
  materias = [],
  handleAddNewMateria,
  handleDeleteMateria,
  seconds,
  isActive,
  toggleTimer,
  resetTimer,
  formatTime,
  onOpenEvaluation,
  userStats
}) {
  const [isAdding, setIsAdding] = useState(false);
  const [novaMateria, setNovaMateria] = useState('');

  const submitNovaMateria = (e) => {
    e.preventDefault();
    if (!novaMateria.trim()) return;
    handleAddNewMateria(novaMateria.trim());
    setNovaMateria('');
    setIsAdding(false);
  };

  return (
    <div className="max-w-xl mx-auto space-y-8">
      <div className="text-center space-y-2">
        <h2 className="text-3xl font-extrabold text-slate-100">Sessão de Estudo</h2>
        <p className="text-slate-400 text-sm">
          Selecione a matéria principal e inicie o cronômetro para acompanhar seu foco.
        </p>
      </div>

      {/* SELEÇÃO DA MATÉRIA PRINCIPAL */}
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
                  className="text-xs text-rose-400 hover:text-rose-300 font-semibold transition flex items-center space-x-1 p-1 hover:bg-rose-500/10 rounded-lg"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                  <span>Excluir</span>
                </button>
              )}
              <button
                type="button"
                onClick={() => setIsAdding(true)}
                className="text-xs text-amber-400 hover:text-amber-300 font-semibold transition flex items-center space-x-1"
              >
                <Plus className="h-3.5 w-3.5" />
                <span>Nova Matéria</span>
              </button>
            </div>
          )}
        </div>

        {isAdding ? (
          <form onSubmit={submitNovaMateria} className="flex space-x-2">
            <input
              type="text"
              autoFocus
              required
              value={novaMateria}
              onChange={(e) => setNovaMateria(e.target.value)}
              placeholder="Ex: Engenharia de Software, Cálculo, Redes..."
              className="flex-1 bg-slate-950 border border-slate-700 rounded-xl px-4 py-2 text-sm text-slate-100 focus:outline-none focus:border-amber-400"
            />
            <button
              type="submit"
              className="bg-amber-500 hover:bg-amber-400 text-slate-950 px-4 py-2 rounded-xl text-xs font-bold transition"
            >
              Adicionar
            </button>
            <button
              type="button"
              onClick={() => {
                setIsAdding(false);
                setNovaMateria('');
              }}
              className="bg-slate-900 hover:bg-slate-700 text-slate-400 px-3 py-2 rounded-xl text-xs transition"
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

      {/* PAINEL DO CRONÔMETRO */}
      <div className="bg-slate-800/80 border border-slate-700/60 p-8 rounded-3xl text-center space-y-6 shadow-xl">
        <div className="text-6xl sm:text-7xl font-extrabold font-mono tracking-tight text-slate-100">
          {formatTime(seconds)}
        </div>

        <div className="flex items-center justify-center space-x-4">
          <button
            onClick={toggleTimer}
            disabled={!selectedMateria}
            className={`px-6 py-3 rounded-2xl font-bold text-sm transition flex items-center space-x-2 shadow-lg ${
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
            className="p-3 bg-slate-900 hover:bg-slate-700 text-slate-400 hover:text-slate-200 border border-slate-700 rounded-2xl transition disabled:opacity-30"
            title="Reiniciar cronômetro"
          >
            <RotateCcw className="h-4 w-4" />
          </button>

          <button
            onClick={onOpenEvaluation}
            disabled={!selectedMateria || seconds < 10}
            className="px-5 py-3 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-sm rounded-2xl transition flex items-center space-x-2 disabled:opacity-40 shadow-lg shadow-emerald-500/10"
            title="Concluir sessão e especificar o conteúdo estudado"
          >
            <Check className="h-4 w-4" />
            <span>Concluir</span>
          </button>
        </div>
      </div>
    </div>
  );
}