import { defineStore } from 'pinia'
import { PiniaGenerics, Record, State } from '../PiniaGenerics'
import { api } from 'src/boot/axios'
import { DailyLog, useDailyLogsStore } from '../daily-log/daily-log-store'
import { Habit, useHabitsStore } from '../habit/habitStore'
import Utils from 'src/util'

export interface HasUser extends Record {
  userID: number
}

export class UserGenerics {
  static generateUserGetters<R extends HasUser>() {
    console.log('inside generateUserGetters')
    return {
      user:
        () =>
        (item: R): User | undefined => {
          return useUsersStore().getByID(item.userID)
        },
      allItemsForUser:
        (state: State<R>) =>
        (userId: number): R[] => {
          return state.items.filter((x) => x.userID === userId)
        },
    }
  }
}

export class UserStatics {
  static getByID(userID?: number) {
    const userStore = useUsersStore()
    const user = userID ? userStore.getByID(userID) : userStore.defaultUser()
    return Utils.hardCheck(user, 'could not find user for static func')
  }
}

export class User extends Record {
  name = 'default'
  completionRateThreshold = 0.95
  startingSampleRate = 2
  timeZoneOffset = 0
  startingRation = 2000
  startDate = ''
  get dailyLogs(): DailyLog[] {
    console.log('getting all user daily logs')
    return useDailyLogsStore().allItemsForUser(
      Utils.hardCheck(
        this.id,
        'fetching records by associated user ID before user record has ID'
      )
    )
  }

  get habits(): Habit[] {
    return useHabitsStore().allItemsForUser(
      Utils.hardCheck(
        this.id,
        'fetching records by associated user ID before user record has ID'
      )
    )
  }
}

export const useUsersStore = defineStore('users', {
  ...PiniaGenerics.stateTree<User>(),
  getters: {
    ...PiniaGenerics.generateStoreGetters<User>(),
    gimmeUser: (state) => (userID?: number) => {
      const user = userID
        ? state.items.find((x) => x.id === userID)
        : state.items.find((x) => x.name === 'DEFAULT')
      return Utils.hardCheck(user, 'could not find user for static func')
    },
    defaultUser: (state) => (): User => {
      return Utils.hardCheck(
        state.items.find((x) => x.name === 'DEFAULT'),
        'default user might not be here'
      )
    },
    latestLog: (state) => (): DailyLog => {
      const defaultUser = Utils.hardCheck(
        state.items.find((x) => x.name === 'DEFAULT'),
        'no default user found'
      )
      const defaultUserId = Utils.hardCheck(
        defaultUser.id,
        'defaultUser was found but does not have id'
      )
      return useDailyLogsStore()
        .allItemsForUser(defaultUserId)
        .sort((a, b) => {
          return Utils.mddl(a, b, 'desc')
        })[0]
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
        .then((response) => {
          console.log('createItem response from backend: ', response)
          this.items.push(item)
        }, Utils.handleError('Error creating item.'))
    },
    async fetchAll() {
      const response = await api.get('/users', {
        headers: {},
        params: {},
      })
      this.items = response.data
    },
    async fetchItem(id: number) {
      const response = await api.get(`/users/${id}`, {
        headers: {},
        params: {},
      })
      return response.data
    },
    async updateItem(item: User) {
      const index = this.items.findIndex((x) => x.id === item.id)
      if (index !== -1) {
        await api
          .patch(`/users/${item.id}`, item, {
            headers: {},
          })
          .then((response) => {
            this.items[index] = { ...this.items[index], ...item }
            return response
          }, Utils.handleError('Error updating item.'))
      }
    },
    async deleteItem(id: number) {
      const index = this.items.findIndex((x) => x.id === id)
      if (index !== -1) {
        await api
          .delete(`/users/${id}`, {
            headers: {},
          })
          .then((response) => {
            this.items.splice(index, 1)
            return response
          }, Utils.handleError('Error deleting item.'))
      }
    },
  },
})
