import { initializeApp, getApps, getApp, FirebaseApp } from 'firebase/app';
import {
  initializeFirestore,
  getFirestore,
  persistentLocalCache,
  persistentMultipleTabManager,
  Firestore,
} from 'firebase/firestore';
import { getAuth, signInAnonymously, onAuthStateChanged, Auth, User } from 'firebase/auth';

export interface FirebaseClientConfig {
  apiKey: string;
  authDomain: string;
  projectId: string;
  storageBucket?: string;
  messagingSenderId?: string;
  appId: string;
}

export const DEFAULT_FIREBASE_CONFIG: FirebaseClientConfig = {
  projectId: 'urnaricardo55777',
  appId: '1:688742901853:web:36119f9a90cb8dad57c5b4',
  storageBucket: 'urnaricardo55777.firebasestorage.app',
  apiKey: 'AIzaSyCr4daoQiIwIR0gMa9pVWllxSHl7_o70nk',
  authDomain: 'urnaricardo55777.firebaseapp.com',
  messagingSenderId: '688742901853',
};

const STORAGE_KEY = 'recreio_firebase_config_v1';

export function getStoredFirebaseConfig(): FirebaseClientConfig {
  const local = localStorage.getItem(STORAGE_KEY);
  if (local) {
    try {
      const parsed = JSON.parse(local);
      if (parsed.projectId && parsed.apiKey) return parsed;
    } catch {
      // ignore
    }
  }

  // Fallback para variáveis de ambiente Vite (caso configuradas em .env)
  const envConfig: FirebaseClientConfig = {
    apiKey: (import.meta as any).env?.VITE_FIREBASE_API_KEY || '',
    authDomain: (import.meta as any).env?.VITE_FIREBASE_AUTH_DOMAIN || '',
    projectId: (import.meta as any).env?.VITE_FIREBASE_PROJECT_ID || '',
    storageBucket: (import.meta as any).env?.VITE_FIREBASE_STORAGE_BUCKET || '',
    messagingSenderId: (import.meta as any).env?.VITE_FIREBASE_MESSAGING_SENDER_ID || '',
    appId: (import.meta as any).env?.VITE_FIREBASE_APP_ID || '',
  };

  if (envConfig.projectId && envConfig.apiKey) {
    return envConfig;
  }

  // Padrão automático nativo: Conexão direta e instantânea sem exigir configuração manual do usuário
  return DEFAULT_FIREBASE_CONFIG;
}

export function saveStoredFirebaseConfig(config: FirebaseClientConfig): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(config));
}

export function clearStoredFirebaseConfig(): void {
  localStorage.removeItem(STORAGE_KEY);
}

let appInstance: FirebaseApp | null = null;
let firestoreInstance: Firestore | null = null;
let authInstance: Auth | null = null;

export function initializeFirebase(): {
  app: FirebaseApp | null;
  db: Firestore | null;
  auth: Auth | null;
  isReady: boolean;
} {
  const config = getStoredFirebaseConfig();
  if (!config || !config.projectId || !config.apiKey) {
    return { app: null, db: null, auth: null, isReady: false };
  }

  try {
    if (getApps().length === 0) {
      appInstance = initializeApp(config);
      // Habilita Cache Persistente (IndexedDB) para funcionamento offline no campo + Realtime sync
      try {
        firestoreInstance = initializeFirestore(appInstance, {
          localCache: persistentLocalCache({
            tabManager: persistentMultipleTabManager(),
          }),
        });
      } catch (cacheErr) {
        // Se já tiver sido inicializado nesta sessão
        firestoreInstance = getFirestore(appInstance);
      }
      authInstance = getAuth(appInstance);
    } else {
      appInstance = getApp();
      firestoreInstance = getFirestore(appInstance);
      authInstance = getAuth(appInstance);
    }

    return {
      app: appInstance,
      db: firestoreInstance,
      auth: authInstance,
      isReady: true,
    };
  } catch (error) {
    console.warn('[Firebase] Erro ao inicializar conexão:', error);
    return {
      app: appInstance,
      db: firestoreInstance,
      auth: authInstance,
      isReady: !!firestoreInstance,
    };
  }
}

export async function ensureAuthenticated(): Promise<User | null> {
  const { auth } = initializeFirebase();
  if (!auth) return null;

  if (auth.currentUser) return auth.currentUser;

  return new Promise((resolve) => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        unsubscribe();
        resolve(user);
      } else {
        try {
          const cred = await signInAnonymously(auth);
          unsubscribe();
          resolve(cred.user);
        } catch (err) {
          console.warn('[Firebase Auth] Erro ao autenticar anonimamente:', err);
          unsubscribe();
          resolve(null);
        }
      }
    });
  });
}
