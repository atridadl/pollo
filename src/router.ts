import { createWebHistory, createRouter } from "vue-router";
import Index from "./pages/Index.vue";
import MyPolls from "./pages/MyPolls.vue";
import Login from "./pages/Login.vue";
import SignUp from "./pages/SignUp.vue";

const history = createWebHistory();
const routes = [
  { path: "/", component: Index },
  { path: "/polls", component: MyPolls },
  { path: "/login", component: Login },
  { path: "/signup", component: SignUp },
];

const router = createRouter({ history, routes });

router.beforeEach((to, from, next) => {
  if (to.path === '/polls' && !localStorage.getItem("uid")) {
    next('/login');
  } else {
    next();
  }
});

export default router;