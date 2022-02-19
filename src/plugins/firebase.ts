import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import * as firebaseConfig from "../../firebaseConfig.json";
import { initializeApp } from 'firebase/app';

const app = initializeApp(firebaseConfig);
const auth = getAuth()
const db = getFirestore();

export { app, auth, db };
