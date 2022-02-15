import { createWebHistory, createRouter } from "vue-router";
import Index from "./pages/Index.vue";
import NewPoll from "./pages/NewPoll.vue";
import Login from "./pages/Login.vue";
import SignUp from "./pages/SignUp.vue";
import { useAccountStore } from './stores/account';
import pinia from "./pinia";

const history = createWebHistory();
const routes = [
  { path: "/", component: Index },
  { path: "/secret", component: NewPoll },
  { path: "/login", component: Login },
  { path: "/signup", component: SignUp }
];

const router = createRouter({ history, routes });

const accountStore = useAccountStore(pinia)

router.beforeEach((to, from, next) => {
  if (to.path === '/secret' && localStorage.getItem('id') === null) {
    next('/login');
  } else {
    next();
  }
});

export default router;