import { RouteRecordRaw } from 'vue-router'
import AccountSettings from 'src/pages/AccountSettings.vue'

const routes: RouteRecordRaw[] = [
  {
    path: '/',
    component: () => import('src/layouts/MainLayout.vue'),
    children: [
      {
        path: '',
        component: () => import('src/pages/IndexPage.vue'),
      },
      {
        path: 'dashboard',
        component: () => import('src/pages/IndexPage.vue'),
      },
      {
        path: 'habits',
        component: () => import('src/pages/HabitsPage.vue'),
      },
      {
        path: 'logs',
        component: () => import('src/pages/DailyLog.vue'),
      },
      {
        path: 'food-logs',
        component: () => import('src/pages/FoodLog.vue'),
      },
      {
        path: 'weight-logs',
        component: () => import('src/pages/WeightLog.vue'),
      },
      {
        path: 'settings',
        component: AccountSettings,
      },
      {
        path: 'completions',
        component: () => import('src/pages/CompletionsPage.vue'),
      },
      {
        path: 'daily-logs',
        component: () => import('src/pages/DailyLogsPage.vue'),
      },
      {
        path: 'super',
        component: () => import('src/pages/SuperPage.vue'),
      },
    ],
  },

  // Always leave this as last one,
  // but you can also remove it
  {
    path: '/:catchAll(.*)*',
    component: () => import('src/pages/ErrorNotFound.vue'),
  },
]

export default routes
