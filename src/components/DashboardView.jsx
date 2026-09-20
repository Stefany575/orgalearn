import React, { useMemo } from 'react';
import { Flame } from 'lucide-react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  Tooltip, 
  ResponsiveContainer, 
  Cell 
} from 'recharts';

export default function DashboardView({ userStats, sessoes = [] }) {
  // Cálculo dinâmico do tempo de estudo nos últimos 7 dias a partir das sessões reais
  const dadosSemanais = useMemo(() => {
    const diasSemana = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];
    const hoje = new Date();
    const mapaDias = [];

    for (let i = 6; i >= 0; i--) {
      const dataRef = new Date();
      dataRef.setDate(hoje.getDate() - i);
      const diaNome = diasSemana[dataRef.getDay()];
      const dataFormatada = dataRef.toISOString().split('T')[0];

      // Somatório de segundos no dia
      const segundosDia = sessoes
        .filter(s => {
          if (!s.criado_em) return false;
          const dataSessao = s.criado_em.toDate 
            ? s.criado_em.toDate().toISOString().split('T')[0] 
            : new Date(s.criado_em).toISOString().split('T')[0];
          return dataSessao === dataFormatada;
        })
        .reduce((acc, s) => acc + (Number(s.duracao_segundos) || 0), 0);

      const minutosDia = Math.round(segundosDia / 60);

      mapaDias.push({
        dia: diaNome,
        minutos: minutosDia,
        data: dataFormatada
      });
    }

    // Identificar o dia com o pico de estudo
    const maiorMinuto = Math.max(...mapaDias.map(d => d.minutos), 0);
    return mapaDias.map(d => ({
      ...d,
      pico: maiorMinuto > 0 && d.minutos === maiorMinuto
    }));
  }, [sessoes]);

  // Formatação personalizada para o balão flutuante (tooltip)
  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      const mins = payload[0].value;
      const h = Math.floor(mins / 60);
      const m = mins % 60;
      const tempoFormatado = h > 0 ? `${h}h ${m}m` : `${m}m`;

      return (
        <div className="bg-slate-950 border border-slate-700 p-2.5 rounded-xl shadow-xl">
          <p className="text-xs font-bold text-slate-200">{label}</p>
          <p className="text-xs text-amber-400 font-mono mt-1">{tempoFormatado} de estudo</p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-extrabold text-slate-100">Dashboard</h2>
          <p className="text-slate-400 text-sm mt-1">Seu tempo de estudo e sua consistência, em um só painel.</p>
        </div>
        <div className="flex items-center space-x-2 bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 px-4 py-2 rounded-full text-xs font-bold">
          <Flame className="h-4 w-4 fill-emerald-400" />
          <span>{userStats.streak || 1} dias seguidos</span>
        </div>
      </div>

      {/* QUADROS DE MÉTRICAS */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-slate-800/80 p-5 rounded-2xl border border-slate-700/60">
          <p className="text-xs text-slate-400 uppercase tracking-wider">Estudado hoje</p>
          <p className="text-2xl font-bold font-mono text-amber-400 mt-2">{userStats.totalHorasHoje}</p>
        </div>
        <div className="bg-slate-800/80 p-5 rounded-2xl border border-slate-700/60">
          <p className="text-xs text-slate-400 uppercase tracking-wider">Semana atual</p>
          <p className="text-2xl font-bold font-mono text-emerald-400 mt-2">{userStats.totalHorasSemana}</p>
        </div>
        <div className="bg-slate-800/80 p-5 rounded-2xl border border-slate-700/60">
          <p className="text-xs text-slate-400 uppercase tracking-wider">Revisões concluídas</p>
          <p className="text-2xl font-bold font-mono text-purple-300 mt-2">{userStats.revisoesConcluidas}</p>
        </div>
        <div className="bg-slate-800/80 p-5 rounded-2xl border border-slate-700/60">
          <p className="text-xs text-slate-400 uppercase tracking-wider">Nível atual</p>
          <p className="text-2xl font-bold font-mono text-slate-100 mt-2">{userStats.nivel}</p>
        </div>
      </div>

      {/* GRÁFICO RECHARTS ALIMENTADO COM SESSÕES REAIS */}
      <div className="bg-slate-800/80 p-6 rounded-2xl border border-slate-700/60 space-y-6">
        <div className="flex justify-between items-center">
          <h3 className="font-bold text-slate-200">Tempo de estudo por dia</h3>
          <span className="text-xs text-slate-400 font-mono">últimos 7 dias</span>
        </div>

        <div className="h-64 w-full pt-4">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={dadosSemanais} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <XAxis 
                dataKey="dia" 
                stroke="#64748b" 
                fontSize={12} 
                tickLine={false} 
                axisLine={false} 
              />
              <YAxis 
                stroke="#64748b" 
                fontSize={12} 
                tickLine={false} 
                axisLine={false} 
                unit="m" 
              />
              <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(255, 255, 255, 0.05)' }} />
              <Bar dataKey="minutos" radius={[8, 8, 0, 0]}>
                {dadosSemanais.map((entry, index) => (
                  <Cell 
                    key={`cell-${index}`} 
                    fill={entry.pico ? '#10b981' : '#f59e0b'} 
                  />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="flex justify-between items-center text-xs text-slate-400 pt-2 border-t border-slate-700/60">
          <span>Retenção estimada nos tópicos revisados</span>
          <span className="text-emerald-400 font-mono font-bold">média 84%</span>
        </div>
      </div>
    </div>
  );
}