import { useMemo } from 'react';
import { Clock, Calendar, BarChart3, Zap } from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer
} from 'recharts';

export default function DashboardView({ userStats = {}, sessoes = [] }) {

  //Cálculo Tempo Total de Mês Atual
  const totalHorasMes = useMemo(() => {
    const hoje = new Date();
    const inicioMes = new Date(hoje.getFullYear(), hoje.getMonth(), 1);

    let segMes = 0;
    sessoes.forEach((s) => {
      if (!s.criado_em) return;
      const dataSessao = s.criado_em?.toDate
        ? s.criado_em.toDate()
        : new Date(s.criado_em);

      if (isNaN(dataSessao?.getTime())) return;

      const duracao = Number(s.duracao_segundos) || 0;
      if (dataSessao >= inicioMes) segMes += duracao;
    });

    // Formata os segundos totais para o padrão "Xh YYm"
    const h = Math.floor(segMes / 3600);
    const m = Math.floor((segMes % 3600) / 60);
    return `${h}h ${m.toString().padStart(2, '0')}m`;
  }, [sessoes]);

  //Cálculo Dados do Gráfico Semanal
  const dadosGraficoSemanal = useMemo(() => {
    const dias = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];
    const hoje = new Date();
    const mapaDias = {};

    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(hoje.getDate() - i);
      const chave = d.toISOString().split('T')[0];
      const diaNome = dias[d.getDay()];
      mapaDias[chave] = { dia: diaNome, minutos: 0 };
    }

    sessoes.forEach((s) => {
      if (!s.criado_em) return;
      const dataSessao = s.criado_em?.toDate
        ? s.criado_em.toDate()
        : new Date(s.criado_em);

      if (isNaN(dataSessao?.getTime())) return;

      const chave = dataSessao.toISOString().split('T')[0];
      if (mapaDias[chave]) {
        const min = Math.round((Number(s.duracao_segundos) || 0) / 60);
        mapaDias[chave].minutos += min;
      }
    });

    return Object.values(mapaDias);
  }, [sessoes]);

  //Interface da Tela
  return (
    <div className="space-y-6">
      {/* Cabeçalho */}
      <div>
        <h2 className="text-3xl font-extrabold text-slate-100">Painel Geral</h2>
        <p className="text-slate-400 text-sm mt-1">
          Resumo do seu progresso, consistência e tempo dedicado aos estudos.
        </p>
      </div>

      {/* 4 CARDS PRINCIPAIS  */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-slate-800/80 p-5 rounded-2xl border border-slate-700/60 shadow-md">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs uppercase font-medium">Estudo Hoje</span>
            <Clock className="h-4 w-4 text-amber-400" />
          </div>
          <p className="text-2xl font-bold font-mono text-amber-400">
            {userStats.totalHorasHoje || '0h 00m'}
          </p>
        </div>

        <div className="bg-slate-800/80 p-5 rounded-2xl border border-slate-700/60 shadow-md">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs uppercase font-medium">Últimos 7 Dias</span>
            <Calendar className="h-4 w-4 text-emerald-400" />
          </div>
          <p className="text-2xl font-bold font-mono text-emerald-400">
            {userStats.totalHorasSemana || '0h 00m'}
          </p>
        </div>

        <div className="bg-slate-800/80 p-5 rounded-2xl border border-slate-700/60 shadow-md">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs uppercase font-medium">Mês Atual</span>
            <BarChart3 className="h-4 w-4 text-purple-400" />
          </div>
          <p className="text-2xl font-bold font-mono text-purple-300">
            {totalHorasMes}
          </p>
        </div>

        <div className="bg-slate-800/80 p-5 rounded-2xl border border-slate-700/60 shadow-md">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs uppercase font-medium">Ofensiva Atual</span>
            <Zap className="h-4 w-4 text-orange-400" />
          </div>
          <p className="text-2xl font-bold font-mono text-orange-300">
            {userStats.diasOfensiva || 0} dia(s)
          </p>
        </div>
      </div>

      {/* GRÁFICO SEMANAL */}
      <div className="bg-slate-800/80 p-6 rounded-2xl border border-slate-700/60 space-y-4 shadow-lg">
        <h3 className="font-bold text-slate-200 text-sm">Tempo de Estudo Recente (minutos)</h3>

        <div className="h-64 w-full pt-2">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={dadosGraficoSemanal}>
              <XAxis dataKey="dia" stroke="#64748b" fontSize={12} tickLine={false} />
              <YAxis stroke="#64748b" fontSize={12} tickLine={false} unit=" min" />
              <Tooltip
                formatter={(val) => [`${val} minutos`, 'Estudado']}
                contentStyle={{
                  backgroundColor: '#020617',
                  borderColor: '#334155',
                  borderRadius: '0.75rem'
                }}
              />
              <Bar dataKey="minutos" fill="#f59e0b" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}