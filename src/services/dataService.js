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
  updateDoc,
  deleteDoc
} from 'firebase/firestore';

//Ligação entre o React e Firebase Firestore
//Gestão de Tópicos
export async function addTopico(userId, titulo, descricao = '') {
  return await addDoc(collection(db, 'topicos'), {
    usuario_id: userId,
    titulo,
    descricao,
    criado_em: serverTimestamp()
  });
}

//Procura todos os tópicos pertencentes ao utilizador
 
export async function getTopicosByUser(userId) {
  const q = query(
    collection(db, 'topicos'), 
    where('usuario_id', '==', userId), 
    orderBy('criado_em', 'desc')
  );
  const querySnapshot = await getDocs(q);
  return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
}

//Gamificação e Sessões de Estudo
export async function atualizarOfensiva(userId) {
  if (!userId) return 0;

  const userRef = doc(db, 'usuarios', userId);
  const userSnap = await getDoc(userRef);


  if (!userSnap.exists()) return 0;

  const dadosUser = userSnap.data();
  const hoje = new Date();
  hoje.setHours(0, 0, 0, 0);
  const hojeStr = hoje.toISOString().split('T')[0]; // Formato "YYYY-MM-DD"

  const ultimaData = dadosUser.ultimaDataEstudo;
  let diasOfensiva = Number(dadosUser.diasOfensiva) || 0;

  if (ultimaData === hojeStr) return diasOfensiva;

  const ontem = new Date(hoje);
  ontem.setDate(ontem.getDate() - 1);
  const ontemStr = ontem.toISOString().split('T')[0];

  if (ultimaData === ontemStr) {
    diasOfensiva += 1;
  } else {
    diasOfensiva = 1;
  }

  await updateDoc(userRef, {
    diasOfensiva: diasOfensiva,
    ultimaDataEstudo: hojeStr
  });

  return diasOfensiva;
}


export async function saveSessao(userId, topicoId, duracaoSegundos) {
  const sessaoRef = await addDoc(collection(db, 'sessoes'), {
    usuario_id: userId,
    topico_id: topicoId,
    duracao_segundos: duracaoSegundos,
    criado_em: serverTimestamp()
  });

  
  await atualizarOfensiva(userId);

  return sessaoRef;
}

//Repetição Espaçada (SM-2)
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

//Exclusão de Dados
export async function deleteMateriaCompleta(userId, materiaNome) {
  const qMateria = query(
    collection(db, 'materias'), 
    where('usuario_id', '==', userId), 
    where('nome', '==', materiaNome)
  );
  const snapMateria = await getDocs(qMateria);
  const deleteMateriasPromises = snapMateria.docs.map(d => deleteDoc(doc(db, 'materias', d.id)));
  await Promise.all(deleteMateriasPromises);

  const qRevisoes = query(
    collection(db, 'revisoes'), 
    where('usuario_id', '==', userId), 
    where('materia', '==', materiaNome)
  );
  const snapRevisoes = await getDocs(qRevisoes);
  const deleteRevisoesPromises = snapRevisoes.docs.map(d => deleteDoc(doc(db, 'revisoes', d.id)));
  await Promise.all(deleteRevisoesPromises);
}

//Remove os agendamentos de revisão de um tópico específico
export async function deleteRevisaoAgendada(userId, topicoNome) {
  const q = query(
    collection(db, 'revisoes'), 
    where('usuario_id', '==', userId), 
    where('topico', '==', topicoNome)
  );
  const snapshot = await getDocs(q);
  const deletePromises = snapshot.docs.map(d => deleteDoc(doc(db, 'revisoes', d.id)));
  await Promise.all(deletePromises);
}