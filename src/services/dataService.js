import { db } from './firebase';
import { 
  collection, 
  addDoc, 
  getDocs, 
  query, 
  where, 
  orderBy, 
  serverTimestamp,
  doc,
  getDoc,
  updateDoc
} from 'firebase/firestore';

/**
 * Adiciona um novo tópico estudado na coleção 'topicos'
 */
export async function addTopico(userId, titulo, descricao = '') {
  return await addDoc(collection(db, 'topicos'), {
    usuario_id: userId,
    titulo,
    descricao,
    criado_em: serverTimestamp()
  });
}

/**
 * Procura todos os tópicos pertencentes ao utilizador
 */
export async function getTopicosByUser(userId) {
  const q = query(
    collection(db, 'topicos'), 
    where('usuario_id', '==', userId), 
    orderBy('criado_em', 'desc')
  );
  const querySnapshot = await getDocs(q);
  return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
}

/**
 * Atualiza os dias de ofensiva (streak) do utilizador com base na data de hoje
 */
export async function atualizarOfensiva(userId) {
  if (!userId) return 0;

  const userRef = doc(db, 'usuarios', userId);
  const userSnap = await getDoc(userRef);

  // Se o documento do utilizador não existir na coleção 'usuarios', ignoramos por segurança
  if (!userSnap.exists()) return 0;

  const dadosUser = userSnap.data();
  const hoje = new Date();
  hoje.setHours(0, 0, 0, 0);
  const hojeStr = hoje.toISOString().split('T')[0]; // Formato "YYYY-MM-DD"

  const ultimaData = dadosUser.ultimaDataEstudo;
  let diasOfensiva = Number(dadosUser.diasOfensiva) || 0;

  // Se já registou estudo hoje, não altera o contador
  if (ultimaData === hojeStr) return diasOfensiva;

  const ontem = new Date(hoje);
  ontem.setDate(ontem.getDate() - 1);
  const ontemStr = ontem.toISOString().split('T')[0];

  if (ultimaData === ontemStr) {
    // Se estudou ontem, incrementa a ofensiva em 1
    diasOfensiva += 1;
  } else {
    // Se passou mais de um dia sem estudar, reinicia a ofensiva para 1
    diasOfensiva = 1;
  }

  // Atualiza no Firebase Firestore
  await updateDoc(userRef, {
    diasOfensiva: diasOfensiva,
    ultimaDataEstudo: hojeStr
  });

  return diasOfensiva;
}

/**
 * Grava o encerramento de uma sessão de cronómetro na coleção 'sessoes'
 * e atualiza automaticamente os dias de ofensiva do utilizador.
 */
export async function saveSessao(userId, topicoId, duracaoSegundos) {
  // 1. Guarda a sessão de estudo
  const sessaoRef = await addDoc(collection(db, 'sessoes'), {
    usuario_id: userId,
    topico_id: topicoId,
    duracao_segundos: duracaoSegundos,
    criado_em: serverTimestamp()
  });

  // 2. Atualiza os dias de ofensiva do utilizador após concluir o estudo
  await atualizarOfensiva(userId);

  return sessaoRef;
}

/**
 * Regista o agendamento de uma revisão calculada pelo algoritmo SM-2
 */
export async function scheduleRevisao(topicoId, dataAgendada, avaliacao, intervaloDias, fatorFacilidade) {
  return await addDoc(collection(db, 'revisoes'), {
    topico_id: topicoId,
    data_agendada: dataAgendada,
    data_realizada: null,
    avaliacao,
    intervalo_dias: intervaloDias,
    fator_facilidade: fatorFacilidade,
    status: 'pendente',
    criado_em: serverTimestamp()
  });
}