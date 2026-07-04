import { createRouter, createWebHistory } from 'vue-router'
import { authStore } from '../iam/application/auth.store'
import AppLayout from '../shared/presentation/layouts/AppLayout.vue'
import HomePage from '../social/presentation/pages/HomePage.vue'
import LoginPage from '../iam/presentation/pages/LoginPage.vue'
import RegisterPage from '../iam/presentation/pages/RegisterPage.vue'
import ProfilePage from '../iam/presentation/pages/ProfilePage.vue'

const router = createRouter({
  history: createWebHistory(),
  routes: [
    { path: '/', redirect: '/home' },
    {
      path: '/',
      component: AppLayout,
      meta: { requiresAuth: true },
      children: [
        { path: 'home', name: 'home', component: HomePage },
        { path: 'profile/user/:id', name: 'profile', component: ProfilePage }
      ]
    },
    { path: '/login', name: 'login', component: LoginPage, meta: { guestOnly: true } },
    { path: '/register', name: 'register', component: RegisterPage, meta: { guestOnly: true } }
  ]
})

router.beforeEach((to) => {
  const loggedIn = Boolean(authStore.currentUser)

  if (to.meta.requiresAuth && !loggedIn) {
    return { path: '/login' }
  }

  if (to.meta.guestOnly && loggedIn) {
    return { path: '/home' }
  }

  return true
})

export default router
