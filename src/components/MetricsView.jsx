import React, { useMemo } from 'react';
import { Clock, Calendar, BarChart3, PieChart as PieIcon, Award } from 'lucide-react';
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer
} from 'recharts';

const CORES_TOPICOS = [
  '#f59e0b', '#10b981', '#6366f1', '#ec4899', '#8b5cf6', '#06b6d4', '#f97316'
];

export default function MetricsView({ sessoes = [], revisoes = [] }) {
  const metricasTempo = useMemo(() => {
    const hoje = new Date();
    const hojeStr = hoje.toISOString().split('T')[0];

    const seteDiasAtras = new Date();
    seteDiasAtras.setDate(seteDiasAtras.getDate() - 7);

    const inicioMes = new Date(hoje.getFullYear(), hoje.getMonth(), 1);

    let segHoje = 0;
    let segSemana = 0;
    let segMes = 0;

    sessoes.forEach((s) => {
      if (!s.criado_em) return;
      const dataSessao = s.criado_em.toDate
        ? s.criado_em.toDate()
        : new Date(s.criado_em);
      const dataStr = dataSessao.toISOString().split('T')[0];
      const duracao = Number(s.duracao_segundos) || 0;

      if (dataStr === hojeStr) segHoje += duracao;
      if (dataSessao >= seteDiasAtras) segSemana += duracao;
      if (dataSessao >= inicioMes) segMes += duracao;
    });

    const formatarHoras = (seg) => {
      const h = Math.floor(seg / 3600);
      const m = Math.floor((seg % 3600) / 60);
      return `${h}h ${m.toString().padStart(2, '0')}m`;
    };

    return {
      hoje: formatarHoras(segHoje),
      semana: formatarHoras(segSemana),
      mes: formatarHoras(segMes)
    };
  }, [sessoes]);

  const dadosPorTopico = useMemo(() => {
    const mapa = {};
    sessoes.forEach((s) => {
      const topicoNome = s.topico || 'Outros';
      const seg = Number(s.duracao_segundos) || 0;
      mapa[topicoNome] = (mapa[topicoNome] || 0) + seg;
    });

    return Object.keys(mapa).map((topico) => {
      const minutos = Math.round(mapa[topico] / 60);
      return {
        name: topico,
        minutos: minutos,
        horasFormatadas: `${Math.floor(minutos / 60)}h ${(minutos % 60).toString().padStart(2, '0')}m`
      };
    }).sort((a, b) => b.minutos - a.minutos);
  }, [sessoes]);

  const mediaEF = useMemo(() => {
    if (revisoes.length === 0) return '2.50';
    const soma = revisoes.reduce((acc, r) => acc + (Number(r.ef) || 2.5), 0);
    return (soma / revisoes.length).toFixed(2);
  }, [revisoes]);

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-extrabold text-slate-100">Métricas & Análise</h2>
        <p className="text-slate-400 text-sm mt-1">
          Visão quantitativa de produtividade e retenção cognitiva consolidada.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-slate-800/80 p-5 rounded-2xl border border-slate-700/60">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs uppercase font-medium">Hoje</span>
            <Clock className="h-4 w-4 text-amber-400" />
          </div>
          <p className="text-2xl font-bold font-mono text-amber-400">{metricasTempo.hoje}</p>
        </div>

        <div className="bg-slate-800/80 p-5 rounded-2xl border border-slate-700/60">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs uppercase font-medium">Semana (7 dias)</span>
            <Calendar className="h-4 w-4 text-emerald-400" />
          </div>
          <p className="text-2xl font-bold font-mono text-emerald-400">{metricasTempo.semana}</p>
        </div>

        <div className="bg-slate-800/80 p-5 rounded-2xl border border-slate-700/60">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs uppercase font-medium">Mês Atual</span>
            <BarChart3 className="h-4 w-4 text-purple-400" />
          </div>
          <p className="text-2xl font-bold font-mono text-purple-300">{metricasTempo.mes}</p>
        </div>

        <div className="bg-slate-800/80 p-5 rounded-2xl border border-slate-700/60">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs uppercase font-medium">Fator EF Médio</span>
            <Award className="h-4 w-4 text-blue-400" />
          </div>
          <p className="text-2xl font-bold font-mono text-blue-300">{mediaEF}</p>
          <span className="text-[10px] text-slate-500">Padrão: 2.50</span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-slate-800/80 p-6 rounded-2xl border border-slate-700/60 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-slate-200 text-sm">Distribuição por Tópico</h3>
            <PieIcon className="h-4 w-4 text-slate-500" />
          </div>
          {dadosPorTopico.length === 0 ? (
            <p className="text-xs text-slate-500 py-10 text-center">Nenhuma sessão registrada.</p>
          ) : (
            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={dadosPorTopico} dataKey="minutos" nameKey="name" cx="50%" cy="50%" outerRadius={80} label={({ name }) => name}>
                    {dadosPorTopico.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={CORES_TOPICOS[index % CORES_TOPICOS.length]} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value) => [`${value} min`, 'Tempo']} contentStyle={{ backgroundColor: '#020617', borderColor: '#334155', borderRadius: '0.75rem' }} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>

        <div className="bg-slate-800/80 p-6 rounded-2xl border border-slate-700/60 space-y-4">
          <h3 className="font-bold text-slate-200 text-sm">Tempo Total por Assunto</h3>
          {dadosPorTopico.length === 0 ? (
            <p className="text-xs text-slate-500 py-10 text-center">Nenhum dado disponível.</p>
          ) : (
            <div className="divide-y divide-slate-700/40 max-h-64 overflow-y-auto pr-1">
              {dadosPorTopico.map((item, index) => (
                <div key={item.name} className="py-2.5 flex items-center justify-between text-xs">
                  <div className="flex items-center space-x-2">
                    <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: CORES_TOPICOS[index % CORES_TOPICOS.length] }} />
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