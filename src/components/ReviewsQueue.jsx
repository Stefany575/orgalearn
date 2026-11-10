import { useMemo } from 'react';
import { BookOpen, Clock, Calendar, Folder, RotateCw, Trash2 } from 'lucide-react';

export default function ReviewsQueue({ revisoes = [], onReviewNow, onDeleteReview }) {
  //Agrupamento por Matéria
  const materiasAgrupadas = useMemo(() => {
    const mapa = {};

    revisoes.forEach((rev) => {
      const nomeMateria = rev.materia || 'Geral';

      if (!mapa[nomeMateria]) {
        mapa[nomeMateria] = {
          materia: nomeMateria,
          itens: []
        };
      }

      mapa[nomeMateria].itens.push(rev);
    });

    return Object.values(mapa);
  }, [revisoes]);

  //Interface da Tela
  return (
    <div className="space-y-6">
      {/* Cabeçalho da página */}
      <div>
        <h2 className="text-3xl font-extrabold text-slate-100">Fila de Revisões</h2>
        <p className="text-slate-400 text-sm mt-1">
          Tópicos organizados por matéria. Para revisar e atualizar o algoritmo, inicie uma sessão no cronômetro.
        </p>
      </div>

      {/* Condição: Se a fila estiver vazia, exibe mensagem de tela limpa */}
      {materiasAgrupadas.length === 0 ? (
        <div className="bg-slate-800/80 p-8 rounded-2xl border border-slate-700/60 text-center space-y-3">
          <BookOpen className="h-10 w-10 text-slate-600 mx-auto" />
          <p className="text-slate-300 font-semibold text-base">Nenhuma revisão na fila!</p>
          <p className="text-slate-500 text-xs">
            Inicie uma sessão de estudo no cronômetro para agendar revisões.
          </p>
        </div>
      ) : (
        <div className="grid gap-6">
          {/* Mapeia e renderiza as "Pastas" de matérias */}
          {materiasAgrupadas.map((grupo) => (
            <div
              key={grupo.materia}
              className="bg-slate-800/80 border border-slate-700/60 rounded-2xl p-5 space-y-4 shadow-lg"
            >
              <div className="flex items-center justify-between border-b border-slate-700/60 pb-3">
                <div className="flex items-center space-x-2.5">
                  <div className="p-2 bg-amber-500/10 border border-amber-500/30 rounded-xl text-amber-400">
                    <Folder className="h-5 w-5" />
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-100 text-lg">{grupo.materia}</h3>
                    <p className="text-xs text-slate-400">
                      {grupo.itens.length} conteúdo(s) nesta disciplina
                    </p>
                  </div>
                </div>
              </div>

              {/* Mapeia e renderiza cada revisão pendente (os cartões individuais) */}
              <div className="space-y-3">
                {grupo.itens.map((rev) => (
                  <div
                    key={rev.id || rev.topico}
                    className="bg-slate-900/70 border border-slate-700/40 p-4 rounded-xl flex flex-col md:flex-row md:items-center justify-between gap-3 hover:border-slate-600 transition"
                  >
                    <div className="space-y-1">
                      <div className="flex items-center space-x-2">
                        <span className="font-semibold text-slate-200 text-sm">
                          {rev.topico || 'Conteúdo geral'}
                        </span>
                        <span className="text-[10px] px-2 py-0.5 rounded-full font-medium bg-amber-500/10 text-amber-400 border border-amber-500/30">
                          {rev.status || 'agendado'}
                        </span>
                      </div>

                      <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-slate-400 pt-0.5">
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
                        onClick={() => onReviewNow(rev.materia, rev.topico)}
                        className="px-3.5 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-bold rounded-xl transition flex items-center space-x-1.5 shadow-md shadow-amber-500/10"
                        title="Ir para o Estudo Ativo e cronometrar esta revisão"
                      >
                        <Clock className="h-3.5 w-3.5" />
                        <span>Revisar no Cronômetro</span>
                      </button>

                      <button
                        onClick={() => onDeleteReview(rev)}
                        className="p-2 bg-slate-950 hover:bg-rose-500/20 text-slate-400 hover:text-rose-400 border border-slate-800 hover:border-rose-500/30 rounded-xl transition"
                        title="Eliminar este agendamento"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}