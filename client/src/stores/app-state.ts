import { defineStore } from 'pinia'

export const useAppStore = defineStore('app-state', {
  state: () => {
    return {
      loading: true,
    }
  },
})
