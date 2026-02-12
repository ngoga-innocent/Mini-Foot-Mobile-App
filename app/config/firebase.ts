import { getApps, initializeApp } from "firebase/app";
import {
    initializeFirestore,
    persistentLocalCache
} from "firebase/firestore";
const firebaseConfig = {
  apiKey: "AIzaSyB1PLSZbHOsKlvLGWMlvnA1KPvHcTgNQ8w",
  authDomain: "minifoot-9b814.firebaseapp.com",
  projectId: "minifoot-9b814",
  storageBucket: "minifoot-9b814.firebasestorage.app",
  messagingSenderId: "815198152725",
  appId: "1:815198152725:web:57c5834d3278140d6ec61c",
  measurementId: "G-ZCRRFWN6R7"
};

const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];

// 🔥 Firestore with OFFLINE support
export const db = initializeFirestore(app, {
  localCache: persistentLocalCache()
});
