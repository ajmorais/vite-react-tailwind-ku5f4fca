import { collection, onSnapshot, addDoc, updateDoc, deleteDoc, doc, getDoc, setDoc } from 'firebase/firestore';
import { db, appId } from '../config/firebase';

export function buildPath(...segments) {
  return ['artifacts', appId, 'public', 'data', ...segments];
}

export function subscribeToCollection(name, onData, onError) {
  return onSnapshot(collection(db, ...buildPath(name)), onData, onError);
}

export function getDocumentRef(collectionName, docId) {
  return doc(db, ...buildPath(collectionName, docId));
}

export async function createCollectionDoc(collectionName, payload) {
  return addDoc(collection(db, ...buildPath(collectionName)), payload);
}

export async function updateCollectionDoc(collectionName, docId, payload) {
  return updateDoc(getDocumentRef(collectionName, docId), payload);
}

export async function deleteCollectionDoc(collectionName, docId) {
  return deleteDoc(getDocumentRef(collectionName, docId));
}

export async function getCollectionDoc(collectionName, docId) {
  return getDoc(getDocumentRef(collectionName, docId));
}

export async function setConfigDoc(docId, payload) {
  return setDoc(doc(db, ...buildPath('configuracoes', docId)), payload);
}

export async function getConfigDoc(docId) {
  return getDoc(doc(db, ...buildPath('configuracoes', docId)));
}
