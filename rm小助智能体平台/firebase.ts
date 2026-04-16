import { initializeApp, getApp, getApps } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import firebaseConfig from './firebase-applet-config.json';

// Check if config is valid (not placeholders)
const isFirebaseConfigValid = 
  firebaseConfig && 
  firebaseConfig.projectId && 
  !firebaseConfig.projectId.includes('remixed') &&
  !firebaseConfig.projectId.includes('TODO');

let app;
if (getApps().length === 0) {
  app = initializeApp(firebaseConfig);
} else {
  app = getApp();
}

export const db = getFirestore(app, firebaseConfig.firestoreDatabaseId);
export { isFirebaseConfigValid };
