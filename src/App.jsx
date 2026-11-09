import { useState, useEffect } from 'react';
import Sidebar from './components/Sidebar';
import StudyTimer from './components/StudyTimer';
import ReviewsQueue from './components/ReviewsQueue';
import ContentsView from './components/ContentsView';
import DashboardView from './components/DashboardView';
import MetricsView from './components/MetricsView';
import AuthModal from './components/AuthModal';
import { useTimer } from './hooks/useTimer';
import { calculateSM2 } from './utils/sm2';
import { auth, db } from './services/firebase';
import { onAuthStateChanged } from 'firebase/auth';
import { signOut } from 'firebase/auth';
import { X } from 'lucide-react';
import { atualizarOfensiva } from './services/dataService';
import { 
  collection, 
  query, 
  where, 
  onSnapshot, 
  addDoc, 
  doc, 
  updateDoc,
  deleteDoc,
  getDocs,
  serverTimestamp 
} from 'firebase/firestore';

export default function App() {
  const [user, setUser] = useState(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('timer');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  
  const [showEvaluationModal, setShowEvaluationModal] = useState(false);
  const [conteudoEspecifico, setConteudoEspecifico] = useState('');

  const [userStats, setUserStats] = useState({
    nome: "Estudante",
    nivel: 1,
    xp: 0,
    nextLevelXp: 1000, 
    totalHorasHoje: "0h 00m",
    totalHorasSemana: "0h 00m",
    revisoesConcluidas: 0,
    diasOfensiva: 1
  });

  const [materias, setMaterias] = useState([]);
  const [selectedMateria, setSelectedMateria] = useState('');
  const [revisoes, setRevisoes] = useState([]);
  const [sessoes, setSessoes] = useState([]);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setAuthLoading(false);
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (!user) return;

    const userDocRef = doc(db, 'usuarios', user.uid);
    const unsubUser = onSnapshot(userDocRef, (snapshot) => {
      if (snapshot.exists()) {
        const data = snapshot.data();
        setUserStats(prev => ({
          ...prev,
          nome: data.nome || user.displayName || 'Estudante',
          nivel: data.nivel || 1,
          xp: data.xp || 0,
          nextLevelXp: data.nextLevelXp || 1000,
          revisoesConcluidas: data.revisoesConcluidas || 0,
          diasOfensiva: data.diasOfensiva || 1
        }));
      }
    });

    const qMaterias = query(collection(db, 'materias'), where('usuario_id', '==', user.uid));
    const unsubMaterias = onSnapshot(qMaterias, (snapshot) => {
      const lista = snapshot.docs.map(d => d.data().nome);
      setMaterias(lista);
      if (lista.length > 0 && !selectedMateria) {
        setSelectedMateria(lista[0]);
      } else if (lista.length === 0) {
        setSelectedMateria('');
      }
    });

    const qRevisoes = query(collection(db, 'revisoes'), where('usuario_id', '==', user.uid));
    const unsubRevisoes = onSnapshot(qRevisoes, (snapshot) => {
      const revisoesList = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setRevisoes(revisoesList);
    });

    const qSessoes = query(collection(db, 'sessoes'), where('usuario_id', '==', user.uid));
    const unsubSessoes = onSnapshot(qSessoes, (snapshot) => {
      const sessoesList = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setSessoes(sessoesList);

      const hojeFormatado = new Date().toISOString().split('T')[0];
      const seteDiasAtras = new Date();
      seteDiasAtras.setDate(seteDiasAtras.getDate() - 7);

      let totalHojeSegundos = 0;
      let totalSemanaSegundos = 0;

      sessoesList.forEach(s => {
        if (!s.criado_em) return;
        const dataSessao = s.criado_em.toDate ? s.criado_em.toDate() : new Date(s.criado_em);
        const dataFormatada = dataSessao.toISOString().split('T')[0];
        const seg = Number(s.duracao_segundos) || 0;

        if (dataFormatada === hojeFormatado) totalHojeSegundos += seg;
        if (dataSessao >= seteDiasAtras) totalSemanaSegundos += seg;
      });

      const formataSegundos = (segundos) => {
        const h = Math.floor(segundos / 3600);
        const m = Math.floor((segundos % 3600) / 60);
        return `${h}h ${m.toString().padStart(2, '0')}m`;
      };

      setUserStats(prev => ({
        ...prev,
        totalHorasHoje: formataSegundos(totalHojeSegundos),
        totalHorasSemana: formataSegundos(totalSemanaSegundos)
      }));
    });

    return () => {
      unsubUser();
      unsubMaterias();
      unsubRevisoes();
      unsubSessoes();
    };
  }, [user, selectedMateria]);

  const { seconds, isActive, toggleTimer, resetTimer, formatTime } = useTimer();

  const hojeStr = new Date().toISOString().split('T')[0];
  const pendingReviewsCount = revisoes.filter((r) => {
    if (!r.dataVencimento) return false;
    return r.dataVencimento <= hojeStr;
  }).length;

  const handleAddNewMateria = async (nome) => {
    if (!user || !nome) return;
    try {
      await addDoc(collection(db, 'materias'), {
        usuario_id: user.uid,
        nome,
        criado_em: serverTimestamp()
      });
      setSelectedMateria(nome);
    } catch (err) {
      console.error('Erro ao adicionar matéria:', err);
    }
  };

  const handleDeleteMateria = async (materiaNome) => {
    if (!user || !materiaNome) return;
    const confirmacao = window.confirm(`Deseja realmente excluir a matéria "${materiaNome}"?`);
    if (!confirmacao) return;

    try {
      const q = query(
        collection(db, 'materias'), 
        where('usuario_id', '==', user.uid), 
        where('nome', '==', materiaNome)
      );
      const snapshot = await getDocs(q);
      const deletePromises = snapshot.docs.map(d => deleteDoc(doc(db, 'materias', d.id)));
      await Promise.all(deletePromises);

      if (selectedMateria === materiaNome) {
        const restantes = materias.filter(m => m !== materiaNome);
        setSelectedMateria(restantes.length > 0 ? restantes[0] : '');
      }
    } catch (err) {
      console.error('Erro ao excluir matéria:', err);
    }
  };

  const handleDeleteReview = async (review) => {
    if (!user || !review?.topico) return;
    const confirmacao = window.confirm(`Deseja remover as revisões agendadas para "${review.topico}"?`);
    if (!confirmacao) return;

    try {
      const q = query(
        collection(db, 'revisoes'),
        where('usuario_id', '==', user.uid),
        where('topico', '==', review.topico)
      );
      const snapshot = await getDocs(q);
      const deletePromises = snapshot.docs.map(d => deleteDoc(doc(db, 'revisoes', d.id)));
      await Promise.all(deletePromises);
    } catch (err) {
      console.error('Erro ao remover revisão:', err);
    }
  };

  const handleOpenEvaluationFromTimer = () => {
    setShowEvaluationModal(true);
  };

  const handleSM2Submit = async (quality) => {
    if (!user || !selectedMateria) return;

    const topicoFinal = conteudoEspecifico.trim() || selectedMateria;
    const duracaoSessao = seconds > 0 ? seconds : 60; 

    try {
      const revisaoExistente = revisoes.find(r => r.topico === topicoFinal && (r.materia === selectedMateria || !r.materia));

      await addDoc(collection(db, 'sessoes'), {
        usuario_id: user.uid,
        materia: selectedMateria,
        topico: topicoFinal,
        conteudoEspecifico: topicoFinal,
        duracao_segundos: duracaoSessao,
        notaSM2: quality,
        criado_em: serverTimestamp()
      });
      resetTimer();

      if (revisaoExistente) {
        const repeticaoAtual = (revisaoExistente.repeticoes || 1) + 1;
        const efAtual = revisaoExistente.ef || 2.5;
        const intervaloAnterior = revisaoExistente.intervalo_dias || 1;

        const resultSM2 = calculateSM2(quality, repeticaoAtual, intervaloAnterior, efAtual);

        const targetDate = new Date();
        targetDate.setDate(targetDate.getDate() + resultSM2.interval);
        const dataVencimentoStr = targetDate.toISOString().split('T')[0];

        const revDocRef = doc(db, 'revisoes', revisaoExistente.id);
        await updateDoc(revDocRef, {
          materia: selectedMateria,
          topico: topicoFinal,
          ultimaRevisao: 'Hoje',
          avaliacaoAnterior: `${quality}/5`,
          ef: resultSM2.easinessFactor,
          intervalo_dias: resultSM2.interval,
          repeticoes: resultSM2.repetitions,
          proximaData: `em ${resultSM2.interval} dia(s)`,
          dataVencimento: dataVencimentoStr,
          status: 'revisado',
          atualizado_em: serverTimestamp()
        });
      } else {
        const resultSM2 = calculateSM2(quality, 1, 1, 2.5);

        const targetDate = new Date();
        targetDate.setDate(targetDate.getDate() + resultSM2.interval);
        const dataVencimentoStr = targetDate.toISOString().split('T')[0];

        await addDoc(collection(db, 'revisoes'), {
          usuario_id: user.uid,
          materia: selectedMateria,
          topico: topicoFinal,
          ultimaRevisao: 'Hoje',
          avaliacaoAnterior: `${quality}/5`,
          ef: resultSM2.easinessFactor,
          intervalo_dias: resultSM2.interval,
          repeticoes: 1,
          status: 'agendado',
          proximaData: `em ${resultSM2.interval} dia(s)`,
          dataVencimento: dataVencimentoStr,
          criado_em: serverTimestamp()
        });
      }

      // ATUALIZA OS DIAS DE OFENSIVA NO FIRESTORE AO CONCLUIR O ESTUDO
      await atualizarOfensiva(user.uid);

      // CÁLCULO DE XP
      const minutosEstudados = Math.max(1, Math.floor(duracaoSessao / 60));
      const xpGanhos = minutosEstudados; 

      let novoXP = (userStats.xp || 0) + xpGanhos;
      let novoNivel = userStats.nivel || 1;
      let metaAtual = userStats.nextLevelXp || 1000;

      while (novoXP >= metaAtual) {
        novoNivel += 1;
        metaAtual += 1000;
      }

      const userDocRef = doc(db, 'usuarios', user.uid);
      await updateDoc(userDocRef, {
        xp: novoXP,
        nivel: novoNivel,
        nextLevelXp: metaAtual,
        revisoesConcluidas: (userStats.revisoesConcluidas || 0) + 1
      });

    } catch (err) {
      console.error('Erro ao processar SM-2 no Firestore:', err);
    }

    setConteudoEspecifico('');
    setShowEvaluationModal(false);
  };

  if (authLoading) {
    return (
      <div className="h-screen bg-slate-950 flex items-center justify-center text-amber-400 font-bold">
        Carregando OrgaLearn...
      </div>
    );
  }

  if (!user) {
    return <AuthModal onLoginSuccess={(currentUser) => setUser(currentUser)} />;
  }

  return (
    <div className="flex h-screen bg-slate-900 text-slate-100 font-sans overflow-hidden">
      {/* Sidebar Responsiva (Gaveta no Smartphone e fixa no PC) */}
      <Sidebar 
        activeTab={activeTab} 
        setActiveTab={setActiveTab} 
        userStats={userStats} 
        pendingReviewsCount={pendingReviewsCount} 
        isOpen={isSidebarOpen}
        setIsOpen={setIsSidebarOpen}
        onLogout={async () => {
         try {
            await signOut(auth);
            resetTimer();
          } catch (err) {
            console.error("Erro ao encerrar sessão:", err);
          }
        }}
      />

      {/* Conteúdo Principal */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Barra de Topo exclusiva para Smartphone */}
        <header className="md:hidden flex items-center justify-between bg-slate-950 border-b border-slate-800 px-4 py-3 shrink-0">
          <div className="flex items-center space-x-3">
            <button 
              onClick={() => setIsSidebarOpen(true)}
              className="p-2 text-slate-300 hover:text-amber-400 focus:outline-hidden cursor-pointer"
            >
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
            <span className="font-extrabold text-sm text-slate-100">OrgaLearn</span>
          </div>
          <div className="flex items-center space-x-2">
            <span className="text-xs font-mono text-amber-400 bg-slate-900 px-2.5 py-1 rounded-full border border-slate-800 font-bold">
              🔥 {userStats?.diasOfensiva || 1}d
            </span>
            <span className="text-xs font-mono text-amber-400 font-bold">Nv. {userStats?.nivel || 1}</span>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto p-4 sm:p-8">
          {activeTab === 'timer' && (
            <StudyTimer 
              selectedMateria={selectedMateria}
              setSelectedMateria={setSelectedMateria}
              materias={materias}
              handleAddNewMateria={handleAddNewMateria}
              handleDeleteMateria={handleDeleteMateria}
              seconds={seconds}
              isActive={isActive}
              toggleTimer={toggleTimer}
              resetTimer={resetTimer}
              formatTime={formatTime}
              onOpenEvaluation={handleOpenEvaluationFromTimer}
              userStats={userStats}
            />
          )}

          {activeTab === 'conteudos' && (
            <ContentsView sessoes={sessoes} />
          )}

          {activeTab === 'revisoes' && (
            <ReviewsQueue 
              revisoes={revisoes} 
              onReviewNow={(materia, topico) => {
                setSelectedMateria(materia);
                setConteudoEspecifico(topico);
                setActiveTab('timer');
              }}
              onDeleteReview={handleDeleteReview}
            />
          )}

          {activeTab === 'dashboard' && (
            <DashboardView userStats={userStats} sessoes={sessoes} />
          )}

          {activeTab === 'metricas' && (
            <MetricsView sessoes={sessoes} revisoes={revisoes} />
          )}
        </main>
      </div>

      {showEvaluationModal && (
        <div 
          onClick={() => setShowEvaluationModal(false)}
          className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4 z-50 cursor-pointer"
        >
          <div 
            onClick={(e) => e.stopPropagation()}
            className="bg-slate-900 border border-slate-800 p-6 rounded-2xl max-w-md w-full space-y-5 shadow-2xl relative cursor-default"
          >
            <button
              onClick={() => setShowEvaluationModal(false)}
              title="Cancelar e fechar"
              className="absolute top-4 right-4 p-1.5 text-slate-400 hover:text-slate-100 hover:bg-slate-800 rounded-lg transition"
            >
              <X className="h-5 w-5" />
            </button>

            <div className="space-y-1 pr-6">
              <h3 className="text-xl font-bold text-slate-100">
                Concluir Sessão de Estudo Ativo
              </h3>
              <p className="text-xs text-slate-400">
                Matéria: <b className="text-amber-400">{selectedMateria}</b>
              </p>
            </div>

            <div className="space-y-1.5">
              <label className="block text-xs font-semibold text-slate-300">
                Conteúdo específico estudado:
              </label>
              <input
                type="text"
                autoFocus
                value={conteudoEspecifico}
                onChange={(e) => setConteudoEspecifico(e.target.value)}
                placeholder="Ex: Diagramas de Sequência, Geometria..."
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-sm text-slate-100 focus:outline-none focus:border-amber-400"
              />
            </div>

            <div className="space-y-2">
              <label className="block text-xs font-semibold text-slate-300">
                Como avalia a sua facilidade neste conteúdo?
              </label>
              <div className="grid grid-cols-6 gap-2">
                {[0, 1, 2, 3, 4, 5].map((nota) => (
                  <button
                    key={nota}
                    onClick={() => handleSM2Submit(nota)}
                    className={`p-3 rounded-xl border font-bold text-base transition ${
                      nota < 3 
                        ? 'bg-rose-500/10 text-rose-400 border-rose-500/30 hover:bg-rose-500/20' 
                        : 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30 hover:bg-emerald-500/20'
                    }`}
                  >
                    {nota}
                  </button>
                ))}
              </div>
              <div className="flex justify-between text-[11px] text-slate-500">
                <span>0 - Difícil</span>
                <span>5 - Fácil</span>
              </div>
            </div>

            <div className="pt-2 border-t border-slate-800 text-center">
              <button
                type="button"
                onClick={() => setShowEvaluationModal(false)}
                className="text-xs text-slate-400 hover:text-rose-400 font-medium transition"
              >
                Cancelar e voltar ao cronômetro
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}