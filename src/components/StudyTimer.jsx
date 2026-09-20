import React from 'react';
import { Play, Pause, RotateCcw, CheckCircle, Plus, Flame } from 'lucide-react';

export default function StudyTimer({
  selectedTopic,
  setSelectedTopic,
  topicos,
  isAddingNewTopic,
  setIsAddingNewTopic,
  newTopicName,
  setNewTopicName,
  handleAddNewTopic,
  seconds,
  isActive,
  toggleTimer,
  resetTimer,
  formatTime,
  onOpenEvaluation,
  userStats
}) {
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-extrabold text-slate-100">Sessão de estudo</h2>
          <p className="text-slate-400 text-sm mt-1">Escolha um tópico, inicie o cronômetro e foque.</p>
        </div>
        <div className="flex items-center space-x-2 bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 px-4 py-2 rounded-full text-xs font-bold">
          <Flame className="h-4 w-4 fill-emerald-400" />
          <span>{userStats.streak} dias seguidos</span>
        </div>
      </div>

      <div className="bg-slate-800/80 p-6 rounded-2xl border border-slate-700/60 shadow-xl space-y-6">
        {!isAddingNewTopic ? (
          <div className="flex items-center justify-between border-b border-slate-700/80 pb-4">
            <div className="flex-1 mr-4">
              <label className="text-xs text-slate-400 block mb-1 font-medium uppercase tracking-wider">Tópico em Foco</label>
              <select 
                value={selectedTopic}
                onChange={(e) => setSelectedTopic(e.target.value)}
                className="w-full bg-slate-900 border border-slate-700 font-semibold text-amber-400 p-3 rounded-xl focus:outline-none focus:border-amber-500 text-lg"
              >
                {topicos.map((t, idx) => (
                  <option key={idx} value={t}>{t}</option>
                ))}
              </select>
            </div>
            <button 
              onClick={() => setIsAddingNewTopic(true)}
              className="mt-5 p-3 bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/30 text-amber-400 rounded-xl flex items-center space-x-1 text-sm font-medium transition"
            >
              <Plus className="h-4 w-4" />
              <span>Novo Tópico</span>
            </button>
          </div>
        ) : (
          <form onSubmit={handleAddNewTopic} className="space-y-3 border-b border-slate-700/80 pb-4">
            <label className="text-xs text-slate-400 block font-medium">Digite o nome do novo tópico:</label>
            <div className="flex space-x-2">
              <input 
                type="text" 
                placeholder="Ex: Arquitetura Serverless / BaaS"
                value={newTopicName}
                onChange={(e) => setNewTopicName(e.target.value)}
                autoFocus
                className="flex-1 bg-slate-900 border border-slate-700 px-4 py-2.5 rounded-xl text-slate-100 focus:outline-none focus:border-amber-500 text-sm"
              />
              <button type="submit" className="px-4 py-2.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold rounded-xl text-sm transition">Salvar</button>
              <button type="button" onClick={() => setIsAddingNewTopic(false)} className="px-3 py-2.5 bg-slate-700 text-slate-300 rounded-xl text-sm">Cancelar</button>
            </div>
          </form>
        )}

        <div className="grid grid-cols-3 gap-4 text-center border-b border-slate-700/80 pb-6">
          <div>
            <span className="text-2xl font-bold font-mono text-slate-100">3</span>
            <p className="text-xs text-slate-400">sessões neste tópico</p>
          </div>
          <div>
            <span className="text-2xl font-bold font-mono text-amber-400">+18</span>
            <p className="text-xs text-slate-400">XP nesta sessão</p>
          </div>
          <div>
            <span className="text-2xl font-bold font-mono text-slate-100">2 dias</span>
            <p className="text-xs text-slate-400">até próxima revisão</p>
          </div>
        </div>

        <div className="py-4 flex flex-col items-center justify-center space-y-6">
          <div className="w-64 h-64 rounded-full border-8 border-amber-500/30 flex items-center justify-center bg-slate-950/80 shadow-2xl shadow-amber-950/20">
            <span className="text-6xl font-extrabold font-mono text-amber-400 tracking-wider">
              {formatTime(seconds)}
            </span>
          </div>

          <div className="flex justify-center space-x-4">
            <button 
              onClick={toggleTimer}
              className={`flex items-center space-x-2 px-8 py-3.5 rounded-xl font-bold text-base transition ${
                isActive ? 'bg-amber-600 text-white' : 'bg-amber-500 text-slate-950 hover:bg-amber-400'
              }`}
            >
              {isActive ? <Pause className="h-5 w-5" /> : <Play className="h-5 w-5" />}
              <span>{isActive ? 'Pausar' : 'Iniciar'}</span>
            </button>

            <button onClick={resetTimer} className="p-3.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl">
              <RotateCcw className="h-5 w-5" />
            </button>

            <button 
              onClick={onOpenEvaluation}
              className="flex items-center space-x-2 px-6 py-3.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl font-bold transition"
            >
              <CheckCircle className="h-5 w-5" />
              <span>Concluir sessão</span>
            </button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-slate-800/60 p-5 rounded-2xl border border-slate-700/50 space-y-3">
          <h3 className="font-bold text-slate-200 text-base">Próximas na fila</h3>
          <div className="space-y-2 text-xs">
            <div className="flex justify-between items-center p-2.5 bg-slate-900/60 rounded-lg">
              <span>Fator de facilidade (EF)</span>
              <span className="bg-amber-500/20 text-amber-400 border border-amber-500/30 px-2 py-0.5 rounded-full font-mono">hoje</span>
            </div>
            <div className="flex justify-between items-center p-2.5 bg-slate-900/60 rounded-lg">
              <span>Modelo de memória — Atkinson & Shiffrin</span>
              <span className="bg-purple-500/20 text-purple-300 border border-purple-500/30 px-2 py-0.5 rounded-full font-mono">em 2 dias</span>
            </div>
            <div className="flex justify-between items-center p-2.5 bg-slate-900/60 rounded-lg">
              <span>Arquitetura BaaS / JAMstack</span>
              <span className="bg-purple-500/20 text-purple-300 border border-purple-500/30 px-2 py-0.5 rounded-full font-mono">em 4 dias</span>
            </div>
          </div>
        </div>

        <div className="bg-slate-800/60 p-5 rounded-2xl border border-slate-700/50 space-y-3">
          <h3 className="font-bold text-slate-200 text-base">Seu progresso</h3>
          <div className="space-y-2">
            <div className="flex justify-between items-baseline">
              <span className="font-bold text-lg text-slate-100">Nível {userStats.nivel}</span>
              <span className="font-mono text-xs text-slate-400">{userStats.xp} / {userStats.nextLevelXp} XP</span>
            </div>
            <div className="w-full bg-slate-900 h-3 rounded-full overflow-hidden border border-slate-700/50">
              <div 
                className="bg-gradient-to-r from-amber-500 to-amber-300 h-full rounded-full" 
                style={{ width: `${(userStats.xp / userStats.nextLevelXp) * 100}%` }}
              ></div>
            </div>
            <p className="text-xs text-slate-400 pt-1">Faltam {userStats.nextLevelXp - userStats.xp} XP para o nível {userStats.nivel + 1}.</p>
          </div>
        </div>
      </div>
    </div>
  );
}