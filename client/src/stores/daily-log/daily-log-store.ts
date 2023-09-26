import { defineStore } from 'pinia'
import { PiniaGenerics, Record, State } from 'src/stores/PiniaGenerics'
import {
  HasUser,
  User,
  UserGenerics,
  useUsersStore,
} from 'src/stores/user/userStore'
import {
  CompletionEntry,
  useCompletionsStore,
} from '../completion/completion-store'
import { api } from 'src/boot/axios'
import Utils from 'src/util'
import { useHabitsStore } from '../habit/habitStore'

export class DailyLog extends Record implements HasUser {
  id?: number | undefined
  getID(): number {
    throw new Error('Method not implemented.')
  }

  userID = -1
  logDate = ''
  previousLogID?: number | undefined
  constructor(options: {
    userID?: number
    logDate?: string
    previousLogID?: number | undefined
  }) {
    super({})
    this.userID = options.userID ?? -1
    this.logDate = options.logDate ?? ''
    this.previousLogID = options.previousLogID
  }

  get completionEntries(): CompletionEntry[] {
    return useCompletionsStore().allItemsForDailyLog(this.getID())
  }

  get previousLog(): DailyLog | undefined {
    if (this.previousLogID) {
      return useDailyLogsStore().getByID(this.previousLogID)
    }
  }

  get incompleteHabits() {
    return this.completionEntries.filter((x) => x.status === 1)
  }

  get qtyIncompleteHabits() {
    return this.incompleteHabits.length
  }

  get completedHabits() {
    return this.completionEntries.filter((x) => x.status === 2)
  }

  get qtyCompletedHabits() {
    return this.completedHabits.length
  }

  get formattedDate() {
    return Utils.d(this.logDate).toLocaleDateString()
  }

  get user(): User {
    return Utils.hardCheck(
      useDailyLogsStore().user(this),
      'no user found for daily log'
    )
  }
}

export interface HasDailyLog extends Record {
  dailyLogID: number
}

export class DailyLogGenerics {
  static generateDailyLogGetters<R extends HasDailyLog>() {
    return {
      dailyLog:
        () =>
        (item: R): DailyLog | undefined => {
          return useDailyLogsStore().getByID(item.dailyLogID)
        },
      allItemsForDailyLog: (state: State<R>) => (dailyLogID: number) => {
        return state.items.filter((x) => x.dailyLogID === dailyLogID)
      },
    }
  }
}

export const useDailyLogsStore = defineStore('daily-logs', {
  ...PiniaGenerics.stateTree<DailyLog>(),
  getters: {
    ...PiniaGenerics.generateStoreGetters<DailyLog>(),
    ...UserGenerics.generateUserGetters<DailyLog>(),
    latestLog: (state) => (userID?: number) => {
      const id =
        typeof userID === 'undefined'
          ? Utils.hardCheck(
              useUsersStore().defaultUser().id,
              'how is a number type causing an issue?'
            )
          : userID
      // console.log('id went from undefined to ', id)
      // console.log('state items: ', state.items, ', id is ', id)
      const logs = state.items.filter((x) => x.userID === id)
      // console.log('all logs for user', logs)
      return logs.sort((a, b) => Utils.mddl(a, b, 'desc'))[0]
    },
    qtyImprovedHabits: () => (logID: number, userID?: number) => {
      const completionStore = useCompletionsStore()
      const completed = completionStore.getCompletedFromLog(logID)
      const userStore = useUsersStore()
      const user = userStore.gimmeUser(userID)
      const habitStore = useHabitsStore()
      return completed.filter(
        (x) => habitStore.completionRate(x.id) <= user.completionRateThreshold
      ).length
    },
    formattedDate: () => (item: DailyLog) => {
      return new Date(item.logDate).toLocaleDateString()
    },
    getDateFromLog:
      () =>
      (item: DailyLog): Date => {
        return Utils.d(item.logDate)
      },
  },
  actions: {
    sampleRate(dailyLogID?: number) {
      const log = Utils.hardCheck(
        this.getByID(
          Utils.hardCheck(
            dailyLogID,
            'sampleRate: dailyLogID is null or undefined'
          )
        ),
        'daily log id provided did not work'
      )
      const userStore = useUsersStore()
      const user = Utils.hardCheck(
        userStore.getByID(log.userID),
        'user related to daily log was not found'
      )
      if (typeof log.previousLogID === 'undefined') {
        return user.startingSampleRate
      } else {
        const prevImproved = this.qtyImprovedHabits(log.previousLogID)
        return Math.max(prevImproved + 1, user.startingSampleRate)
      }
    },
    async reSampleHabits(dailyLogID?: number) {
      if (typeof dailyLogID === 'undefined')
        throw new Error('resample failed because id was undefined.')
      const dailyLog = Utils.hardCheck(
        this.items.find((x) => x.id === dailyLogID),
        'daily log does not come up by this id'
      )
      console.log('re-sampling ', this.formattedDate(dailyLog))
      const completionStore = useCompletionsStore()
      completionStore.resetFailedFromLog(dailyLogID)
      const notcompleted =
        completionStore.getFailedOrUnspecifiedFromLog(dailyLogID)
      const habitStore = useHabitsStore()
      let habits = notcompleted.map((x) =>
        Utils.hardCheck(
          habitStore.getByID(x.habitID),
          'somehow the habitID did not link back to a real record'
        )
      )
      habits = habits.sort((a, b) => {
        return (
          habitStore.priorCompletionRate(Utils.d(dailyLog.logDate), a.id) -
          habitStore.priorCompletionRate(Utils.d(dailyLog.logDate), b.id)
        )
      })
      habits = habits.slice(0, this.sampleRate(dailyLogID) - 1)
      for (let i = 0; i < habits.length; i++) {
        const relatedDailyLogs = habits[i].completionEntries.filter(
          (y) => y.dailyLogID === dailyLog.id
        )
        for (let j = 0; j < relatedDailyLogs.length; j++) {
          relatedDailyLogs[j].status = 1
          await useCompletionsStore().updateItem(relatedDailyLogs[j])
        }
      }
    },
    // todo: make these generic
    // problem is 'this' is possibly undefined
    async createItem(item: DailyLog) {
      let newItem
      await api
        .post('/daily-logs', item, {
          headers: {},
          params: {},
        })
        .then((response) => {
          console.log('createItem response from backend: ', response)
          newItem = response.data
          this.items.push(newItem)
        }, Utils.handleError('Error creating item.'))
    },
    async fetchAll() {
      const response = await api.get('/daily-logs', {
        headers: {},
        params: {},
      })
      this.items = response.data
    },
    async fetchItem(id: number) {
      const response = await api.get(`/daily-logs/${id}`, {
        headers: {},
        params: {},
      })
      return response.data
    },
    async updateItem(item: DailyLog) {
      const index = this.items.findIndex((x) => x.id === item.id)
      if (index !== -1) {
        await api
          .patch(`/daily-logs/${item.id}`, item, {
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
          .delete(`/daily-logs/${id}`, {
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
