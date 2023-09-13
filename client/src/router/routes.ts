import { RouteRecordRaw } from 'vue-router'

const routes: RouteRecordRaw[] = [
  {
    path: '/',
    component: () => import('layouts/MainLayout.vue'),
    children: [{
        path: '',
        component: () => import('pages/IndexPage.vue')
      },
      { 
        path: 'dashboard', 
        component: () => import('pages/IndexPage.vue') 
      },
      {
        path: 'habits',
        component: () => import('pages/HabitsPage.vue')
      },
      {
        path: 'logs',
        component: () => import('pages/DailyLog.vue')
      },
      {
        path: 'food-logs',
        component: () => import('pages/FoodLog.vue')
      },
      {
        path: 'weight-logs',
        component: () => import('pages/WeightLog.vue')
      },
      {
        path: 'settings',
        component: () => import('pages/AccountSettings.vue')
      },
      {
        path: 'completions',
        component: () => import('pages/CompletionsPage.vue')
      },
      {
        path: 'daily-logs',
        component: () => import('pages/DailyLogsPage.vue')
      },
      {
        path: 'super',
        component: () => import('pages/SuperPage.vue')
      }
    ],
  },

  // Always leave this as last one,
  // but you can also remove it
  {
    path: '/:catchAll(.*)*',
    component: () => import('pages/ErrorNotFound.vue'),
  },
]

export default routes
