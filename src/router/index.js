import { createRouter, createWebHistory } from 'vue-router'

import HomeView from '../views/HomeView.vue'
import LoginPage from '../views/loginPage.vue'

const routes = [
  {
    path: '/',
    name: 'home',
    component: LoginPage
  },
   {
    path: '/',
    name: 'login',
    component: HomeView
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

export default router