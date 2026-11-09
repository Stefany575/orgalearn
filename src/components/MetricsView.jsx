import { useMemo } from 'react';
import { Clock, Calendar, PieChart as PieIcon, BookOpen, CheckCircle2 } from 'lucide-react';
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer
} from 'recharts';

const CORES_PALETA = [
  '#f59e0b', '#10b981', '#6366f1', '#ec4899', '#8b5cf6', '#06b6d4', '#f97316'
];

export default function MetricsView({ sessoes = [] }) {
  // 1. Consolidação Temporal (Hoje e Semana)
  const metricasTempo = useMemo(() => {
    const hoje = new Date();
    const hojeStr = hoje.toISOString().split('T')[0];

    const seteDiasAtras = new Date();
    seteDiasAtras.setDate(seteDiasAtras.getDate() - 7);

    let segHoje = 0;
    let segSemana = 0;

    sessoes.forEach((s) => {
      if (!s.criado_em) return;
      const dataSessao = s.criado_em?.toDate
        ? s.criado_em.toDate()
        : new Date(s.criado_em);

      if (isNaN(dataSessao?.getTime())) return;

      const dataStr = dataSessao.toISOString().split('T')[0];
      const duracao = Number(s.duracao_segundos) || 0;

      if (dataStr === hojeStr) segHoje += duracao;
      if (dataSessao >= seteDiasAtras) segSemana += duracao;
    });

    const formatarHoras = (seg) => {
      const h = Math.floor(seg / 3600);
      const m = Math.floor((seg % 3600) / 60);
      return `${h}h ${m.toString().padStart(2, '0')}m`;
    };

    return {
      hoje: formatarHoras(segHoje),
      semana: formatarHoras(segSemana)
    };
  }, [sessoes]);

  // Total exato de ciclos de estudo concluídos (igual ao número de registos no histórico)
  const totalCiclosRealizados = useMemo(() => {
    if (!Array.isArray(sessoes)) return 0;
    return sessoes.length;
  }, [sessoes]);

  // 2. Top 3 Tópicos Mais Estudados
  const topTopicos = useMemo(() => {
    const mapa = {};
    sessoes.forEach((s) => {
      const topico = s.conteudoEspecifico || s.topico || 'Geral';
      const seg = Number(s.duracao_segundos) || 0;
      mapa[topico] = (mapa[topico] || 0) + seg;
    });

    return Object.keys(mapa)
      .map((topico) => {
        const seg = mapa[topico];
        const h = Math.floor(seg / 3600);
        const m = Math.floor((seg % 3600) / 60);
        return {
          nome: topico,
          segundos: seg,
          horasFormatadas: `${h}h ${m.toString().padStart(2, '0')}m`
        };
      })
      .sort((a, b) => b.segundos - a.segundos)
      .slice(0, 3);
  }, [sessoes]);

  // 3. Distribuição Consolidada por Matéria
  const dadosPorMateria = useMemo(() => {
    const mapa = {};
    sessoes.forEach((s) => {
      const materia = s.materia || 'Geral';
      const seg = Number(s.duracao_segundos) || 0;
      mapa[materia] = (mapa[materia] || 0) + seg;
    });

    return Object.keys(mapa)
      .map((materia) => {
        const seg = mapa[materia];
        const minutos = Math.round(seg / 60);
        const h = Math.floor(seg / 3600);
        const m = Math.floor((seg % 3600) / 60);
        return {
          name: materia,
          segundos: seg,
          minutos,
          horasFormatadas: `${h}h ${m.toString().padStart(2, '0')}m`
        };
      })
      .sort((a, b) => b.segundos - a.segundos);
  }, [sessoes]);

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-extrabold text-slate-100">Métricas e Análise</h2>
        <p className="text-slate-400 text-sm mt-1">
          Visão quantitativa de produtividade e foco por disciplina.
        </p>
      </div>

      {/* CARDS SUPERIORES (HOJE, SEMANA E CICLOS/REVISÕES REALIZADAS) */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-slate-800/80 p-5 rounded-2xl border border-slate-700/60 shadow-md">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs uppercase font-medium">Hoje</span>
            <Clock className="h-4 w-4 text-amber-400" />
          </div>
          <p className="text-2xl font-bold font-mono text-amber-400">{metricasTempo.hoje}</p>
        </div>

        <div className="bg-slate-800/80 p-5 rounded-2xl border border-slate-700/60 shadow-md">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs uppercase font-medium">Semana (7 dias)</span>
            <Calendar className="h-4 w-4 text-emerald-400" />
          </div>
          <p className="text-2xl font-bold font-mono text-emerald-400">{metricasTempo.semana}</p>
        </div>

        <div className="bg-slate-800/80 p-5 rounded-2xl border border-slate-700/60 shadow-md">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs uppercase font-medium">Revisões Realizadas</span>
            <CheckCircle2 className="h-4 w-4 text-sky-400" />
          </div>
          <p className="text-2xl font-bold font-mono text-sky-400">{totalCiclosRealizados}</p>
        </div>
      </div>

      {/* TOP TÓPICOS EM FOCO */}
      <div className="bg-slate-800/80 p-6 rounded-2xl border border-slate-700/60 space-y-4 shadow-lg">
        <div className="flex items-center space-x-2">
          <BookOpen className="h-5 w-5 text-emerald-400" />
          <h3 className="font-bold text-slate-100 text-base">Tópicos em Foco</h3>
        </div>

        {topTopicos.length === 0 ? (
          <p className="text-xs text-slate-500 py-3 text-center">Nenhum tópico registrado ainda.</p>
        ) : (
          <div className="space-y-2.5 pt-1">
            {topTopicos.map((item) => (
              <div
                key={item.nome}
                className="bg-slate-900/80 border border-slate-700/50 px-4 py-3 rounded-2xl flex items-center justify-between text-sm"
              >
                <span className="font-semibold text-slate-200 truncate">{item.nome}</span>
                <span className="font-mono text-amber-400 font-bold ml-3 text-sm">{item.horasFormatadas}</span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* DISTRIBUIÇÃO E HISTÓRICO POR MATÉRIA */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-slate-800/80 p-6 rounded-2xl border border-slate-700/60 space-y-4 shadow-lg">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-slate-200 text-sm">Distribuição por Matéria</h3>
            <PieIcon className="h-4 w-4 text-slate-500" />
          </div>

          {dadosPorMateria.length === 0 ? (
            <p className="text-xs text-slate-500 py-10 text-center">Nenhuma sessão registrada.</p>
          ) : (
            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={dadosPorMateria}
                    dataKey="minutos"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    outerRadius={80}
                    label={({ name }) => name}
                  >
                    {dadosPorMateria.map((entry, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={CORES_PALETA[index % CORES_PALETA.length]}
                      />
                    ))}
                  </Pie>
                  <Tooltip
                    formatter={(value) => [`${value} min`, 'Tempo']}
                    contentStyle={{ backgroundColor: '#020617', borderColor: '#334155', borderRadius: '0.75rem' }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>

        <div className="bg-slate-800/80 p-6 rounded-2xl border border-slate-700/60 space-y-4 shadow-lg">
          <h3 className="font-bold text-slate-200 text-sm">Tempo Total por Matéria</h3>
          {dadosPorMateria.length === 0 ? (
            <p className="text-xs text-slate-500 py-10 text-center">Nenhum dado disponível.</p>
          ) : (
            <div className="divide-y divide-slate-700/40 max-h-64 overflow-y-auto pr-1">
              {dadosPorMateria.map((item, index) => (
                <div key={item.name} className="py-2.5 flex items-center justify-between text-xs">
                  <div className="flex items-center space-x-2">
                    <span
                      className="w-2.5 h-2.5 rounded-full"
                      style={{ backgroundColor: CORES_PALETA[index % CORES_PALETA.length] }}
                    />
                    <span className="font-medium text-slate-200">{item.name}</span>
                  </div>
                  <span className="font-mono text-slate-400 font-semibold">{item.horasFormatadas}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}