import { defineStore } from 'pinia'
import { Record } from '../PiniaGenerics'
import { api } from 'src/boot/axios'
import Utils from 'src/util'
import {
  CompletionEntry,
  useCompletionsStore,
} from '../completion/completionStore'
import { DailyLog, useDailyLogsStore } from '../dailyLog/dailyLogStore'

export interface HasUser extends Record {
  userID?: number
}

export class User extends Record {
  name = 'default'
  completionRateThreshold = 0.95
  startingSampleRate = 2
  timeZoneOffset = 0
  startingRation = 2000
  startDate = ''
  minRation = 1500
  minWeight = 200
  startingWeight = 200
}

export interface UserState {
  user?: User
}

export const useUsersStore = defineStore('users', {
  state: (): UserState => {
    return {
      user: undefined,
    }
  },
  getters: {
    getUser: (state) => () => {
      return Utils.hardCheck(
        state.user,
        'expected user to exist in store by now'
      )
    },
    threshold: (state) => () => {
      return Utils.hardCheck(state.user).completionRateThreshold
    },
  },
  actions: {
    // todo: make these generic
    // problem is 'this' is possibly undefined
    async createItem(item: User) {
      await api
        .post('/users', item, {
          headers: {},
          params: {},
        })
        .then(async (response) => {
          console.log('createItem response from backend: ', response)
          const newUser: User = response.data
          this.user = newUser
          const dls = useDailyLogsStore()
          await dls.createItem(
            new DailyLog({
              userID: newUser.id,
              logDate: new Date().toISOString(),
              previousLogID: undefined,
              baseRation: newUser.startingRation,
              lastModified: new Date().toISOString(),
            })
          )
        }, Utils.handleError('Error creating item.'))
    },
    async fetchAll() {
      const response = await api.get('/users', {
        headers: {},
        params: {},
      })
      this.user = response.data[0]
    },
    async fetchItem(id: number) {
      const response = await api.get(`/users/${id}`, {
        headers: {},
        params: {},
      })
      return response.data
    },
    async updateItem(item: User) {
      await api
        .patch(`/users/${item.id}`, item, { headers: {} })
        .then((response) => {
          this.user = { ...this.user, ...item }
          return response
        }, Utils.handleError('Error updating user.'))
    },
    async deleteItem() {
      const uid = this.getUser().id
      await api
        .delete(`/users/${uid}`, {
          headers: {},
        })
        .then((response) => {
          return response
        }, Utils.handleError('Error deleting item.'))
    },
  },
})
