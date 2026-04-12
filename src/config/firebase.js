import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyCPztA_Y8CrotlU9l8WVdZqOAxAlOwIfr8",
  authDomain: "frota3bpm-checklist-24a37.firebaseapp.com",
  databaseURL: "https://frota3bpm-checklist-24a37-default-rtdb.firebaseio.com",
  projectId: "frota3bpm-checklist-24a37",
  storageBucket: "frota3bpm-checklist-24a37.firebasestorage.app",
  messagingSenderId: "413595995326",
  appId: "1:413595995326:web:52c5e94a3513f511c6a2ef"
};

export const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
export const appId = 'pmce-vtr-producao-v2';
