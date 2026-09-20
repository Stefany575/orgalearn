import React from 'react';

export default function ReviewsQueue({ revisoes, onReviewNow }) {
  const pendentesCount = revisoes.filter(r => r.status === 'pendente').length;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-extrabold text-slate-100">Fila de revisões</h2>
          <p className="text-slate-400 text-sm mt-1">Organizada pelo algoritmo SM-2 — revise o que está no ponto certo de esquecimento.</p>
        </div>
        <div className="bg-amber-500/10 border border-amber-500/30 text-amber-400 px-4 py-2 rounded-full text-xs font-bold font-mono">
          {pendentesCount} pendentes hoje
        </div>
      </div>

      <div className="space-y-3">
        {revisoes.map((rev, idx) => (
          <div 
            key={rev.id} 
            className={`p-5 rounded-2xl border flex items-center justify-between transition ${
              rev.status === 'pendente' 
                ? 'bg-gradient-to-r from-amber-500/10 via-slate-800 to-slate-800 border-amber-500/40' 
                : 'bg-slate-800/60 border-slate-700/50'
            }`}
          >
            <div className="flex items-center space-x-4">
              <span className="font-mono text-xs text-slate-500 font-bold">0{idx + 1}</span>
              <div>
                <h4 className="font-bold text-slate-100 text-base">{rev.topico}</h4>
                <p className="text-xs text-slate-400 mt-0.5">
                  {rev.status === 'pendente' 
                    ? `Última revisão: ${rev.ultimaRevisao} · avaliação anterior: ${rev.avaliacaoAnterior}`
                    : `Próxima revisão ${rev.proximaData}`}
                </p>
              </div>
            </div>

            <div className="flex items-center space-x-6">
              <div className="text-center font-mono">
                <span className="text-lg font-bold text-emerald-400">{rev.ef}</span>
                <p className="text-[10px] text-slate-500 uppercase tracking-widest">EF</p>
              </div>

              <button 
                onClick={() => onReviewNow(rev.topico)}
                className={`px-4 py-2.5 rounded-xl text-xs font-bold transition ${
                  rev.status === 'pendente'
                    ? 'bg-amber-500 hover:bg-amber-400 text-slate-950'
                    : 'bg-slate-700/50 hover:bg-slate-700 text-slate-300 border border-slate-600'
                }`}
              >
                {rev.status === 'pendente' ? 'Revisar agora' : 'Agendada'}
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}