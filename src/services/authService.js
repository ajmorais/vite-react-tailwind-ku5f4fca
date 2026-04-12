import { signInAnonymously, onAuthStateChanged } from 'firebase/auth';

export async function initAnonymousAuth(auth) {
  try {
    await signInAnonymously(auth);
  } catch (error) {
    console.error('Falha ao autenticar anonimamente:', error);
  }
}

export function subscribeAuth(auth, callback) {
  return onAuthStateChanged(auth, callback);
}
