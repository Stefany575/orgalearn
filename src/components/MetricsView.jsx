import React, { useMemo } from 'react';
import { 
  Clock, 
  Calendar, 
  BarChart3, 
  PieChart as PieIcon, 
  Award, 
  Zap 
} from 'lucide-react';
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis
} from 'recharts';

const CORES_PALETA = [
  '#f59e0b', '#10b981', '#6366f1', '#ec4899', '#8b5cf6', '#06b6d4', '#f97316'
];

export default function MetricsView({ sessoes = [], revisoes = [] }) {
  // 1. Consolidação de Tempo
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

  // 2. Mapeamento de Horários Mais Produtivos (Turnos)
  const dadosTurnos = useMemo(() => {
    const turnos = {
      'Madrugada (00h-06h)': 0,
      'Manhã (06h-12h)': 0,
      'Tarde (12h-18h)': 0,
      'Noite (18h-24h)': 0
    };

    sessoes.forEach((s) => {
      if (!s.criado_em) return;
      const dataSessao = s.criado_em.toDate ? s.criado_em.toDate() : new Date(s.criado_em);
      const hora = dataSessao.getHours();
      const minutos = Math.round((Number(s.duracao_segundos) || 0) / 60);

      if (hora >= 0 && hora < 6) turnos['Madrugada (00h-06h)'] += minutos;
      else if (hora >= 6 && hora < 12) turnos['Manhã (06h-12h)'] += minutos;
      else if (hora >= 12 && hora < 18) turnos['Tarde (12h-18h)'] += minutos;
      else turnos['Noite (18h-24h)'] += minutos;
    });

    const lista = Object.keys(turnos).map((key) => ({
      turno: key.split(' ')[0],
      faixa: key,
      minutos: turnos[key],
      horasFormatadas: `${Math.floor(turnos[key] / 60)}h ${(turnos[key] % 60).toString().padStart(2, '0')}m`
    }));

    const maisProdutivo = [...lista].sort((a, b) => b.minutos - a.minutos)[0];

    return {
      lista,
      picoProdutivo: maisProdutivo && maisProdutivo.minutos > 0 ? maisProdutivo.faixa : 'Sem dados suficientes'
    };
  }, [sessoes]);

  // 3. Distribuição por Tópico
  const dadosPorTopico = useMemo(() => {
    const mapa = {};
    sessoes.forEach((s) => {
      const topico = s.topico || 'Outros';
      const seg = Number(s.duracao_segundos) || 0;
      mapa[topico] = (mapa[topico] || 0) + seg;
    });

    return Object.keys(mapa).map((topico) => {
      const minutos = Math.round(mapa[topico] / 60);
      return {
        name: topico,
        minutos,
        horasFormatadas: `${Math.floor(minutos / 60)}h ${(minutos % 60).toString().padStart(2, '0')}m`
      };
    }).sort((a, b) => b.minutos - a.minutos);
  }, [sessoes]);

  // 4. Média do EF
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
          Visão quantitativa de produtividade, curva do esquecimento e hábitos de foco.
        </p>
      </div>

      {/* CARDS DE TEMPO CONSOLIDADO */}
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
          <span className="text-[10px] text-slate-500">Padrão do SM-2: 2.50</span>
        </div>
      </div>

      {/* MAPEAMENTO DE HORÁRIOS PRODUTIVOS (GRÁFICO DE TURNOS) */}
      <div className="bg-slate-800/80 p-6 rounded-2xl border border-slate-700/60 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <h3 className="font-bold text-slate-200 text-sm flex items-center space-x-2">
              <Zap className="h-4 w-4 text-amber-400" />
              <span>Horários & Turnos Mais Produtivos</span>
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Identificação de janelas com maior volume de foco para autorregulação.
            </p>
          </div>
          <div className="bg-amber-500/10 border border-amber-500/30 px-3 py-1 rounded-xl text-xs text-amber-400 font-semibold self-start sm:self-auto">
            Pico de Foco: {dadosTurnos.picoProdutivo}
          </div>
        </div>

        <div className="h-60 w-full pt-2">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={dadosTurnos.lista}>
              <XAxis dataKey="turno" stroke="#64748b" fontSize={12} tickLine={false} />
              <YAxis stroke="#64748b" fontSize={12} tickLine={false} unit=" min" />
              <Tooltip 
                formatter={(val) => [`${val} minutos`, 'Tempo de Estudo']}
                contentStyle={{ backgroundColor: '#020617', borderColor: '#334155', borderRadius: '0.75rem' }} 
              />
              <Bar dataKey="minutos" fill="#f59e0b" radius={[8, 8, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* DISTRIBUIÇÃO POR TÓPICO */}
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
                  <Pie
                    data={dadosPorTopico}
                    dataKey="minutos"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    outerRadius={80}
                    label={({ name }) => name}
                  >
                    {dadosPorTopico.map((entry, index) => (
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

        <div className="bg-slate-800/80 p-6 rounded-2xl border border-slate-700/60 space-y-4">
          <h3 className="font-bold text-slate-200 text-sm">Tempo Total por Tópico</h3>
          {dadosPorTopico.length === 0 ? (
            <p className="text-xs text-slate-500 py-10 text-center">Nenhum dado disponível.</p>
          ) : (
            <div className="divide-y divide-slate-700/40 max-h-64 overflow-y-auto pr-1">
              {dadosPorTopico.map((item, index) => (
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