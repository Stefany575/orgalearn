import React, { useMemo } from 'react';
import { Folder, BookOpen, Clock, Calendar, CheckCircle2 } from 'lucide-react';

export default function ContentsView({ sessoes = [] }) {
  // Agrupa as sessões por Matéria Principal
  const materiasAgrupadas = useMemo(() => {
    const mapa = {};

    sessoes.forEach((s) => {
      const matNome = s.materia || s.topico || 'Geral';
      if (!mapa[matNome]) {
        mapa[matNome] = {
          nome: matNome,
          totalSegundos: 0,
          conteudos: []
        };
      }

      const duracao = Number(s.duracao_segundos) || 0;
      mapa[matNome].totalSegundos += duracao;

      // Formata a data e hora do estudo
      let dataFormatada = 'Data recente';
      if (s.criado_em) {
        const d = s.criado_em.toDate ? s.criado_em.toDate() : new Date(s.criado_em);
        dataFormatada = d.toLocaleDateString('pt-BR', {
          day: '2-digit',
          month: '2-digit',
          year: 'numeric',
          hour: '2-digit',
          minute: '2-digit'
        });
      }

      mapa[matNome].conteudos.push({
        id: s.id,
        conteudo: s.conteudoEspecifico || s.topico || 'Sessão geral',
        nota: s.notaSM2 !== undefined ? s.notaSM2 : null,
        data: dataFormatada,
        duracaoFormatada: `${Math.floor(duracao / 60)} min`
      });
    });

    return Object.values(mapa).sort((a, b) => b.totalSegundos - a.totalSegundos);
  }, [sessoes]);

  const formatarHorasTotal = (seg) => {
    const h = Math.floor(seg / 3600);
    const m = Math.floor((seg % 3600) / 60);
    return `${h}h ${m.toString().padStart(2, '0')}m`;
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-extrabold text-slate-100">Histórico de Conteúdos</h2>
        <p className="text-slate-400 text-sm mt-1">
          Visão consolidada de todas as matérias e tópicos específicos estudados com suas respectivas datas.
        </p>
      </div>

      {materiasAgrupadas.length === 0 ? (
        <div className="bg-slate-800/80 p-8 rounded-2xl border border-slate-700/60 text-center space-y-3">
          <BookOpen className="h-10 w-10 text-slate-600 mx-auto" />
          <p className="text-slate-300 font-semibold text-base">Nenhum conteúdo registrado ainda!</p>
          <p className="text-slate-500 text-xs">
            Inicie uma sessão no cronômetro para registrar matérias e conteúdos estudados.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {materiasAgrupadas.map((materia) => (
            <div
              key={materia.nome}
              className="bg-slate-800/80 border border-slate-700/60 rounded-2xl p-5 space-y-4 shadow-lg hover:border-slate-600 transition"
            >
              <div className="flex items-center justify-between border-b border-slate-700/60 pb-3">
                <div className="flex items-center space-x-2">
                  <div className="p-2 bg-amber-500/10 border border-amber-500/30 rounded-xl text-amber-400">
                    <Folder className="h-5 w-5" />
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-100 text-base">{materia.nome}</h3>
                    <p className="text-[11px] text-slate-400">
                      {materia.conteudos.length} registro(s) realizado(s)
                    </p>
                  </div>
                </div>

                <div className="text-right">
                  <span className="text-xs font-mono font-bold text-amber-400">
                    {formatarHorasTotal(materia.totalSegundos)}
                  </span>
                  <p className="text-[10px] text-slate-500 uppercase tracking-wider">Tempo total</p>
                </div>
              </div>

              {/* Lista dos conteúdos específicos */}
              <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
                {materia.conteudos.map((item, idx) => (
                  <div
                    key={item.id || idx}
                    className="bg-slate-900/60 border border-slate-700/40 p-3 rounded-xl flex items-center justify-between text-xs hover:border-slate-600 transition"
                  >
                    <div className="space-y-1">
                      <div className="flex items-center space-x-2">
                        <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400 flex-shrink-0" />
                        <span className="font-semibold text-slate-200">{item.conteudo}</span>
                      </div>
                      <div className="flex items-center space-x-3 text-[11px] text-slate-500">
                        <span className="flex items-center space-x-1">
                          <Calendar className="h-3 w-3" />
                          <span>{item.data}</span>
                        </span>
                        <span className="flex items-center space-x-1">
                          <Clock className="h-3 w-3" />
                          <span>{item.duracaoFormatada}</span>
                        </span>
                      </div>
                    </div>

                    {item.nota !== null && (
                      <span className="px-2 py-0.5 rounded-lg bg-emerald-500/10 text-emerald-400 font-bold border border-emerald-500/20 font-mono text-[11px]">
                        Nota {item.nota}/5
                      </span>
                    )}
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