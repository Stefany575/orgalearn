import React, { useMemo } from 'react';
import { BookOpen, CheckCircle, Clock, Calendar, RotateCw, Trash2 } from 'lucide-react';

export default function ReviewsQueue({ revisoes = [], onReviewNow, onCompleteReview, onDeleteReview }) {
  // Agrupa todas as revisões pelo nome do tópico para manter apenas 1 card por assunto
  const revisoesAgrupadas = useMemo(() => {
    const mapa = {};

    revisoes.forEach((rev) => {
      const topicoNome = rev.topico || 'Sem Tópico';

      if (!mapa[topicoNome]) {
        mapa[topicoNome] = {
          ...rev,
          totalSessoesDoAssunto: 1
        };
      } else {
        mapa[topicoNome].totalSessoesDoAssunto += 1;
        
        if ((rev.repeticoes || 1) >= (mapa[topicoNome].repeticoes || 1)) {
          mapa[topicoNome] = {
            ...rev,
            id: rev.id || mapa[topicoNome].id,
            totalSessoesDoAssunto: mapa[topicoNome].totalSessoesDoAssunto
          };
        }
      }
    });

    return Object.values(mapa);
  }, [revisoes]);

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-extrabold text-slate-100">Fila de Revisões (SM-2)</h2>
        <p className="text-slate-400 text-sm mt-1">
          Tópicos agendados com base na curva do esquecimento para otimizar sua retenção.
        </p>
      </div>

      {revisoesAgrupadas.length === 0 ? (
        <div className="bg-slate-800/80 p-8 rounded-2xl border border-slate-700/60 text-center space-y-3">
          <BookOpen className="h-10 w-10 text-slate-600 mx-auto" />
          <p className="text-slate-300 font-semibold text-base">Nenhuma revisão na fila!</p>
          <p className="text-slate-500 text-xs">
            Inicie uma sessão de estudo com o cronômetro para que os tópicos entrem no ciclo.
          </p>
        </div>
      ) : (
        <div className="grid gap-4">
          {revisoesAgrupadas.map((rev) => (
            <div
              key={rev.id || rev.topico}
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
                  
                  <span className="flex items-center space-x-1">
                    <RotateCw className="h-3.5 w-3.5 text-slate-500" />
                    <span>Revisões feitas: <b className="text-purple-300">{rev.repeticoes || 1}</b></span>
                  </span>

                  <span>
                    Última nota: <b className="text-emerald-400">{rev.avaliacaoAnterior || 'N/A'}</b>
                  </span>
                </div>
              </div>

              <div className="flex items-center space-x-2 self-end md:self-center">
                <button
                  onClick={() => onReviewNow(rev.topico)}
                  className="px-3 py-2 bg-slate-900 hover:bg-slate-700 text-slate-300 border border-slate-700 text-xs font-semibold rounded-xl transition flex items-center space-x-1.5"
                  title="Cronometrar sessão para este tópico"
                >
                  <Clock className="h-3.5 w-3.5" />
                  <span>Cronometrar</span>
                </button>

                <button
                  onClick={() => onCompleteReview(rev)}
                  className="px-4 py-2 bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-xs font-bold rounded-xl transition flex items-center space-x-1.5 shadow-lg shadow-emerald-500/10"
                  title="Avaliar desempenho e recalcular intervalo SM-2"
                >
                  <CheckCircle className="h-4 w-4" />
                  <span>Avaliar & Concluir</span>
                </button>

                <button
                  onClick={() => onDeleteReview(rev)}
                  className="p-2 bg-slate-900 hover:bg-rose-500/20 text-slate-400 hover:text-rose-400 border border-slate-800 hover:border-rose-500/30 rounded-xl transition"
                  title="Eliminar este tópico da fila"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}