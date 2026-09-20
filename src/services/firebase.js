import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

// Substitua com as credenciais do seu projeto na consola do Google Firebase
const firebaseConfig = {
  apiKey: "AIzaSyCpdB0mYnZ3sQrNyuDWLbaKbuoemE0QxRk",
  authDomain: "orgalearn-e8515.firebaseapp.com",
  projectId: "orgalearn-e8515",
  storageBucket: "orgalearn-e8515.firebasestorage.app",
  messagingSenderId: "306183541882",
  appId: "1:306183541882:web:6e83de9a342db2d94b17c3"
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const db = getFirestore(app);