import { createApp } from 'vue'
import App from './App.vue'
import { createPinia } from 'pinia'
import router from "./router";
import './index.css';
import { initializeApp } from 'firebase/app';

const firebaseConfig = {
    apiKey: "AIzaSyA8UchwSEgCFyTSfYadxpU_5jr_yXe_fr0",
    authDomain: "pollo-v2.firebaseapp.com",
    projectId: "pollo-v2",
    storageBucket: "pollo-v2.appspot.com",
    messagingSenderId: "950810357086",
    appId: "1:950810357086:web:73fdbdbd73d9c09747f3cf"
};

const app = initializeApp(firebaseConfig);

createApp(App).use(router).use(createPinia()).mount('#app');
