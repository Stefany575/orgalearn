import { db } from './firebase';
import { 
  collection, 
  addDoc, 
  getDocs, 
  query, 
  where, 
  orderBy, 
  serverTimestamp 
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
 * Grava o encerramento de uma sessão de cronómetro na coleção 'sessoes'
 */
export async function saveSessao(userId, topicoId, duracaoSegundos) {
  return await addDoc(collection(db, 'sessoes'), {
    usuario_id: userId,
    topico_id: topicoId,
    duracao_segundos: duracaoSegundos,
    criado_em: serverTimestamp()
  });
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