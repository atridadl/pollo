import { createApp } from 'vue'
import App from './App.vue'
import { createPinia } from 'pinia'
import router from "./router";
import './index.css';
import * as firebaseConfig from "../firebaseConfig.json";
import { initializeApp } from 'firebase/app';

const app = initializeApp(firebaseConfig);

createApp(App).use(router).use(createPinia()).mount('#app');
