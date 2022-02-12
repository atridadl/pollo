import { createWebHistory, createRouter } from "vue-router";
import Index from "./pages/Index.vue";
import NewPoll from "./pages/NewPoll.vue"
import { useAccountStore } from './stores/account'
import pinia from "./pinia";

const history = createWebHistory();
const routes = [
  { path: "/", component: Index },
  { path: "/secret", component: NewPoll }
];

const router = createRouter({ history, routes });

const accountStore = useAccountStore(pinia)

router.beforeEach((to, from, next) => {
  if (to.fullPath === '/secret') {
    if (accountStore.account.name) {
      next('/login');
    }
  }
  next();
});

export default router;