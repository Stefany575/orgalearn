import { useMemo } from 'react';
import { Folder, Clock, Calendar, CheckCircle2 } from 'lucide-react';

export default function ContentsView({ sessoes = [] }) {
  // Agrupar e ordenar sessões por matéria (da mais recente para a mais antiga)
  const materiasAgrupadas = useMemo(() => {
    const mapa = {};

    // Ordenar todas as sessões por data decrescente (mais recente primeiro)
    const sessoesOrdenadas = [...sessoes].sort((a, b) => {
      const dataA = a.criado_em?.toDate ? a.criado_em.toDate() : new Date(a.criado_em || 0);
      const dataB = b.criado_em?.toDate ? b.criado_em.toDate() : new Date(b.criado_em || 0);
      return dataB - dataA; // Mais recente primeiro
    });

    sessoesOrdenadas.forEach((s) => {
      const materia = s.materia || 'Geral';
      if (!mapa[materia]) {
        mapa[materia] = {
          nome: materia,
          totalSegundos: 0,
          registros: []
        };
      }
      mapa[materia].totalSegundos += Number(s.duracao_segundos) || 0;
      mapa[materia].registros.push(s);
    });

    return Object.values(mapa);
  }, [sessoes]);

  const formatarTempoTotal = (segundos) => {
    const h = Math.floor(segundos / 3600);
    const m = Math.floor((segundos % 3600) / 60);
    return `${h}h ${m.toString().padStart(2, '0')}m`;
  };

  const formatarData = (timestamp) => {
    if (!timestamp) return 'Data recente';
    const data = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    if (isNaN(data.getTime())) return 'Data recente';
    return data.toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="space-y-8 max-w-4xl mx-auto">
      <div>
        <h2 className="text-3xl font-extrabold text-slate-100">Histórico de Conteúdos</h2>
        <p className="text-slate-400 text-sm mt-1">
          Visão consolidada de todas as matérias e tópicos específicos estudados.
        </p>
      </div>

      {materiasAgrupadas.length === 0 ? (
        <div className="bg-slate-800/80 border border-slate-700/60 p-12 rounded-3xl text-center space-y-3">
          <Folder className="h-12 w-12 text-slate-600 mx-auto" />
          <p className="text-sm text-slate-400 font-medium">Nenhum conteúdo estudado registrado ainda.</p>
        </div>
      ) : (
        <div className="space-y-6">
          {materiasAgrupadas.map((mat) => (
            <div 
              key={mat.nome} 
              className="bg-slate-800/80 border border-slate-700/60 p-6 rounded-3xl space-y-6 shadow-xl"
            >
              {/* Cabeçalho da Matéria */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-slate-700/60 pb-4 gap-2">
                <div className="flex items-center space-x-3">
                  <div className="p-3 bg-amber-500/10 border border-amber-500/30 rounded-2xl text-amber-400">
                    <Folder className="h-6 w-6" />
                  </div>
                  <div>
                    <h3 className="text-xl font-black text-slate-100 tracking-tight">{mat.nome}</h3>
                    <p className="text-xs text-slate-400 font-medium">{mat.registros.length} registro(s) realizado(s)</p>
                  </div>
                </div>

                <div className="text-left sm:text-right bg-slate-900/60 border border-slate-700/40 px-4 py-2 rounded-xl">
                  <span className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider">Tempo Total</span>
                  <span className="text-sm font-mono font-bold text-amber-400">{formatarTempoTotal(mat.totalSegundos)}</span>
                </div>
              </div>

              {/* Lista de Registos (Já ordenada do mais recente para o mais antigo) */}
              <div className="space-y-3 max-h-96 overflow-y-auto pr-1">
                {mat.registros.map((reg, idx) => {
                  const minutos = Math.round((Number(reg.duracao_segundos) || 0) / 60);
                  return (
                    <div 
                      key={reg.id || idx}
                      className="bg-slate-900/90 border border-slate-700/50 p-4 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:border-slate-600 transition"
                    >
                      <div className="flex items-start space-x-3">
                        <CheckCircle2 className="h-5 w-5 text-emerald-400 shrink-0 mt-0.5" />
                        <div className="space-y-1">
                          <h4 className="font-bold text-slate-200 text-sm">{reg.conteudoEspecifico || reg.topico || mat.nome}</h4>
                          <div className="flex items-center space-x-4 text-xs text-slate-400">
                            <span className="flex items-center space-x-1">
                              <Calendar className="h-3.5 w-3.5 text-slate-500" />
                              <span>{formatarData(reg.criado_em)}</span>
                            </span>
                            <span className="flex items-center space-x-1 font-mono text-slate-300">
                              <Clock className="h-3.5 w-3.5 text-slate-500" />
                              <span>{minutos} min</span>
                            </span>
                          </div>
                        </div>
                      </div>

                      {reg.nota_facilidade && (
                        <div className="self-end sm:self-center bg-slate-950 border border-slate-800 px-3 py-1.5 rounded-xl text-xs font-bold text-emerald-400">
                          Nota {reg.nota_facilidade}/5
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}