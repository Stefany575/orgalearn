import React, { useState, useEffect } from 'react';
import Sidebar from './components/Sidebar';
import StudyTimer from './components/StudyTimer';
import ReviewsQueue from './components/ReviewsQueue';
import DashboardView from './components/DashboardView';
import MetricsView from './components/MetricsView';
import AuthModal from './components/AuthModal';
import { useTimer } from './hooks/useTimer';
import { calculateSM2 } from './utils/sm2';
import { auth, db } from './services/firebase';
import { onAuthStateChanged } from 'firebase/auth';
import { X } from 'lucide-react';
import { 
  collection, 
  query, 
  where, 
  onSnapshot, 
  addDoc, 
  doc, 
  updateDoc,
  serverTimestamp 
} from 'firebase/firestore';

export default function App() {
  const [user, setUser] = useState(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('timer');
  
  const [showEvaluationModal, setShowEvaluationModal] = useState(false);
  const [reviewBeingEvaluated, setReviewBeingEvaluated] = useState(null);

  const [userStats, setUserStats] = useState({
    nome: "Estudante",
    nivel: 1,
    xp: 0,
    nextLevelXp: 100,
    totalHorasHoje: "0h 00m",
    totalHorasSemana: "0h 00m",
    revisoesConcluidas: 0,
    streak: 1
  });

  const [topicos, setTopicos] = useState([]);
  const [selectedTopic, setSelectedTopic] = useState('');
  const [isAddingNewTopic, setIsAddingNewTopic] = useState(false);
  const [newTopicName, setNewTopicName] = useState('');
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
          nextLevelXp: data.nextLevelXp || 100,
          revisoesConcluidas: data.revisoesConcluidas || 0
        }));
      }
    });

    const qTopicos = query(collection(db, 'topicos'), where('usuario_id', '==', user.uid));
    const unsubTopicos = onSnapshot(qTopicos, (snapshot) => {
      const topicosList = snapshot.docs.map(doc => doc.data().titulo);
      setTopicos(topicosList);
      if (topicosList.length > 0 && !selectedTopic) {
        setSelectedTopic(topicosList[0]);
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

        if (dataFormatada === hojeFormatado) {
          totalHojeSegundos += seg;
        }
        if (dataSessao >= seteDiasAtras) {
          totalSemanaSegundos += seg;
        }
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
      unsubTopicos();
      unsubRevisoes();
      unsubSessoes();
    };
  }, [user, selectedTopic]);

  const { seconds, isActive, toggleTimer, resetTimer, formatTime } = useTimer();

  const handleAddNewTopic = async (e) => {
    e.preventDefault();
    if (!newTopicName.trim() || !user) return;

    const formatted = newTopicName.trim();
    try {
      await addDoc(collection(db, 'topicos'), {
        usuario_id: user.uid,
        titulo: formatted,
        criado_em: serverTimestamp()
      });
      setSelectedTopic(formatted);
      setNewTopicName('');
      setIsAddingNewTopic(false);
    } catch (err) {
      console.error('Erro ao adicionar tópico:', err);
    }
  };

  const handleOpenEvaluationFromTimer = () => {
    setReviewBeingEvaluated(null);
    setShowEvaluationModal(true);
  };

  const handleOpenEvaluationFromQueue = (review) => {
    setReviewBeingEvaluated(review);
    setSelectedTopic(review.topico);
    setShowEvaluationModal(true);
  };

  const handleSM2Submit = async (quality) => {
    if (!user || !selectedTopic) return;

    try {
      if (reviewBeingEvaluated) {
        const repeticaoAtual = (reviewBeingEvaluated.repeticoes || 1) + 1;
        const efAtual = reviewBeingEvaluated.ef || 2.5;
        const intervaloAnterior = reviewBeingEvaluated.intervalo_dias || 1;

        const resultSM2 = calculateSM2(quality, repeticaoAtual, intervaloAnterior, efAtual);

        const revDocRef = doc(db, 'revisoes', reviewBeingEvaluated.id);
        await updateDoc(revDocRef, {
          ultimaRevisao: 'Hoje',
          avaliacaoAnterior: `${quality}/5`,
          ef: resultSM2.easinessFactor,
          intervalo_dias: resultSM2.interval,
          repeticoes: resultSM2.repetitions,
          proximaData: `em ${resultSM2.interval} dia(s)`,
          status: 'revisado',
          atualizado_em: serverTimestamp()
        });
      } else {
        const duracaoSessao = seconds > 0 ? seconds : 1;
        const resultSM2 = calculateSM2(quality, 1, 1, 2.5);

        await addDoc(collection(db, 'sessoes'), {
          usuario_id: user.uid,
          topico: selectedTopic,
          duracao_segundos: duracaoSessao,
          criado_em: serverTimestamp()
        });

        await addDoc(collection(db, 'revisoes'), {
          usuario_id: user.uid,
          topico: selectedTopic,
          ultimaRevisao: 'Hoje',
          avaliacaoAnterior: `${quality}/5`,
          ef: resultSM2.easinessFactor,
          intervalo_dias: resultSM2.interval,
          repeticoes: 1,
          status: 'agendado',
          proximaData: `em ${resultSM2.interval} dia(s)`,
          criado_em: serverTimestamp()
        });

        resetTimer();
      }

      const novoXP = userStats.xp + 18;
      let novoNivel = userStats.nivel;
      let proxXP = userStats.nextLevelXp;

      if (novoXP >= proxXP) {
        novoNivel += 1;
        proxXP += 150;
      }

      const userDocRef = doc(db, 'usuarios', user.uid);
      await updateDoc(userDocRef, {
        xp: novoXP,
        nivel: novoNivel,
        nextLevelXp: proxXP,
        revisoesConcluidas: (userStats.revisoesConcluidas || 0) + 1
      });

    } catch (err) {
      console.error('Erro ao processar SM-2 no Firestore:', err);
    }

    setReviewBeingEvaluated(null);
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
    <div className="flex h-screen bg-slate-900 text-slate-100 font-sans">
      <Sidebar 
        activeTab={activeTab} 
        setActiveTab={setActiveTab} 
        userStats={userStats} 
        pendingReviewsCount={revisoes.length} 
      />

      <main className="flex-1 overflow-y-auto p-8">
        {activeTab === 'timer' && (
          <StudyTimer 
            selectedTopic={selectedTopic}
            setSelectedTopic={setSelectedTopic}
            topicos={topicos}
            isAddingNewTopic={isAddingNewTopic}
            setIsAddingNewTopic={setIsAddingNewTopic}
            newTopicName={newTopicName}
            setNewTopicName={setNewTopicName}
            handleAddNewTopic={handleAddNewTopic}
            seconds={seconds}
            isActive={isActive}
            toggleTimer={toggleTimer}
            resetTimer={resetTimer}
            formatTime={formatTime}
            onOpenEvaluation={handleOpenEvaluationFromTimer}
            userStats={userStats}
          />
        )}

        {activeTab === 'revisoes' && (
          <ReviewsQueue 
            revisoes={revisoes} 
            onReviewNow={(topico) => {
              setSelectedTopic(topico);
              setActiveTab('timer');
            }}
            onCompleteReview={handleOpenEvaluationFromQueue}
          />
        )}

        {activeTab === 'dashboard' && (
          <DashboardView userStats={userStats} sessoes={sessoes} />
        )}

        {activeTab === 'metricas' && (
          <MetricsView sessoes={sessoes} revisoes={revisoes} />
        )}
      </main>

      {showEvaluationModal && (
        <div 
          onClick={() => {
            setShowEvaluationModal(false);
            setReviewBeingEvaluated(null);
          }}
          className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4 z-50 cursor-pointer"
        >
          <div 
            onClick={(e) => e.stopPropagation()}
            className="bg-slate-900 border border-slate-800 p-6 rounded-2xl max-w-md w-full space-y-6 shadow-2xl relative cursor-default"
          >
            <button
              onClick={() => {
                setShowEvaluationModal(false);
                setReviewBeingEvaluated(null);
              }}
              title="Cancelar e fechar"
              className="absolute top-4 right-4 p-1.5 text-slate-400 hover:text-slate-100 hover:bg-slate-800 rounded-lg transition"
            >
              <X className="h-5 w-5" />
            </button>

            <div className="text-center space-y-2 pr-4">
              <h3 className="text-xl font-bold text-slate-100">
                {reviewBeingEvaluated ? 'Como foi a sua revisão?' : 'Como foi o seu desempenho?'}
              </h3>
              <p className="text-xs text-slate-400">
                Sua nota atualizará o cálculo do SM-2 para <b className="text-amber-400">{selectedTopic || 'o tópico'}</b>.
              </p>
            </div>

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

            <div className="flex justify-between text-xs text-slate-500">
              <span>0 - Esqueceu totalmente</span>
              <span>5 - Lembrança perfeita</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}