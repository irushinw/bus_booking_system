import { initializeApp, getApps, getApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

const firebaseConfig = {
  apiKey: "AIzaSyB8pYe85FYibcNfx3TMepQtT2kZQ75vgJE",
  authDomain: "bus-system-f970c.firebaseapp.com",
  projectId: "bus-system-f970c",
  storageBucket: "bus-system-f970c.firebasestorage.app",
  messagingSenderId: "206385527393",
  appId: "1:206385527393:web:0d11473e014027f78dc820",
  measurementId: "G-93M7F4WZKR",
};

const app = getApps().length ? getApp() : initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);

export default app;
