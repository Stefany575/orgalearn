import React from 'react';
import { BookOpen, CheckCircle, Clock, Calendar } from 'lucide-react';

export default function ReviewsQueue({ revisoes = [], onReviewNow, onCompleteReview }) {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-extrabold text-slate-100">Fila de Revisões (SM-2)</h2>
        <p className="text-slate-400 text-sm mt-1">
          Tópicos agendados com base na curva do esquecimento e no seu desempenho anterior.
        </p>
      </div>

      {revisoes.length === 0 ? (
        <div className="bg-slate-800/80 p-8 rounded-2xl border border-slate-700/60 text-center space-y-3">
          <BookOpen className="h-10 w-10 text-slate-600 mx-auto" />
          <p className="text-slate-300 font-semibold text-base">Nenhuma revisão na fila!</p>
          <p className="text-slate-500 text-xs">
            Inicie uma sessão de estudo com o cronômetro para que os tópicos entrem no ciclo.
          </p>
        </div>
      ) : (
        <div className="grid gap-4">
          {revisoes.map((rev) => (
            <div
              key={rev.id}
              className="bg-slate-800/80 border border-slate-700/60 p-5 rounded-2xl flex flex-col md:flex-row md:items-center justify-between gap-4 hover:border-amber-500/40 transition"
            >
              <div className="space-y-1">
                <div className="flex items-center space-x-2">
                  <span className="font-bold text-slate-100 text-base">{rev.topico}</span>
                  <span className="text-[11px] px-2 py-0.5 rounded-full font-medium bg-amber-500/10 text-amber-400 border border-amber-500/30">
                    {rev.status || 'agendado'}
                  </span>
                </div>

                <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-slate-400 pt-1">
                  <span className="flex items-center space-x-1">
                    <Calendar className="h-3.5 w-3.5 text-slate-500" />
                    <span>Próxima: <b className="text-slate-300">{rev.proximaData || 'Hoje'}</b></span>
                  </span>
                  <span>Última nota: <b className="text-emerald-400">{rev.avaliacaoAnterior || 'N/A'}</b></span>
                  <span>Fator EF: <b className="text-amber-400">{typeof rev.ef === 'number' ? rev.ef.toFixed(2) : (rev.ef || '2.50')}</b></span>
                  <span>Repetições: <b className="text-purple-300">{rev.repeticoes || 1}</b></span>
                </div>
              </div>

              <div className="flex items-center space-x-2 self-end md:self-center">
                <button
                  onClick={() => onReviewNow(rev.topico)}
                  className="px-3 py-2 bg-slate-900 hover:bg-slate-700 text-slate-300 border border-slate-700 text-xs font-semibold rounded-xl transition flex items-center space-x-1.5"
                >
                  <Clock className="h-3.5 w-3.5" />
                  <span>Cronometrar</span>
                </button>

                <button
                  onClick={() => onCompleteReview(rev)}
                  className="px-4 py-2 bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-xs font-bold rounded-xl transition flex items-center space-x-1.5 shadow-lg shadow-emerald-500/10"
                >
                  <CheckCircle className="h-4 w-4" />
                  <span>Avaliar & Concluir</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}