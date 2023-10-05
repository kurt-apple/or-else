import { defineStore } from 'pinia'
import {
  DailyLog,
  // DailyLogGenerics,
  HasDailyLog,
  useDailyLogsStore,
} from '../dailyLog/dailyLogStore'
import { PiniaGenerics, Record } from '../PiniaGenerics'
import {
  /* HabitGenerics, */ HasHabit,
  useHabitsStore,
} from '../habit/habitStore'
import { api } from 'src/boot/axios'
import Utils from 'src/util'

export class CompletionEntry extends Record implements HasDailyLog, HasHabit {
  habitID = -1
  dailyLogID = -1
  status: 0 | 1 | 2 = 0

  static defaults(): CompletionEntry {
    const temp: CompletionEntry = {
      habitID: -1,
      dailyLogID: -1,
      status: 0,
    }
    return temp
  }
}

export const useCompletionsStore = defineStore('completion-entries', {
  ...PiniaGenerics.stateTree<CompletionEntry>(),
  getters: {
    ...PiniaGenerics.generateStoreGetters<CompletionEntry>(),
    // ...HabitGenerics.generateHabitGetters<CompletionEntry>(),
    // ...DailyLogGenerics.generateDailyLogGetters<CompletionEntry>(),
    latestCompletionEntryForHabit:
      (state) =>
      (habitID?: number): CompletionEntry => {
        if (typeof habitID === 'undefined')
          throw new Error(
            'cannot retrieve related records off of undefined habit id'
          )
        const logsStore = useDailyLogsStore()
        const latestLog = logsStore.latestLog()
        const entriesOfLatestLog: CompletionEntry[] = state.items.filter(
          (x) => x.dailyLogID === latestLog.id
        )
        return Utils.hardCheck(
          entriesOfLatestLog.find((x) => x.habitID === habitID),
          `completion entry from latest log was not found for habit id ${habitID}`
        )
      },
    isSampled:
      () =>
      (entry: CompletionEntry): boolean => {
        const habitsStore = useHabitsStore()
        const thorns = Utils.hardCheck(
          habitsStore.thorns(),
          'no daily log found'
        )
        return typeof thorns.find((x) => x.id === entry.habitID) !== 'undefined'
      },
    getCompletedFromLog: (state) => (logID: number) => {
      return state.items
        .filter((x) => x.dailyLogID === logID)
        .filter((x) => x.status === 2)
    },
    getFailedFromLog: (state) => (logID: number) => {
      return state.items
        .filter((x) => x.dailyLogID === logID)
        .filter((x) => x.status === 1)
    },
    getFailedOrUnspecifiedFromLog: (state) => (logID: number) => {
      return state.items
        .filter((x) => x.dailyLogID === logID)
        .filter((x) => x.status !== 2)
    },
    getHabit: () => (c: CompletionEntry) => {
      const habitStore = useHabitsStore()
      return habitStore.getByID(c.habitID)
    },
  },
  actions: {
    resetFailedFromLog(logID: number) {
      this.getFailedFromLog(logID).forEach((x) => {
        x.status = 0
      })
    },
    allItemsForHabit(habitID?: number) {
      if (typeof habitID === 'undefined')
        throw new Error('cannot find items based on undefined habit id')
      return this.items.filter((x) => x.habitID === habitID)
    },
    allItemsForDailyLog(dailyLogID?: number) {
      if (typeof dailyLogID === 'undefined')
        throw new Error('cannot do math on undefined id')
      return this.items.filter((x) => x.dailyLogID === dailyLogID)
    },
    dateValueFromDailyLog(completionEntryID?: number) {
      if (typeof completionEntryID === 'undefined')
        throw new Error('completionEntryID is undefined')
      const completion = Utils.hardCheck(
        this.getByID(completionEntryID),
        'completion from id argument is not found'
      )
      const dlstore = useDailyLogsStore()
      const log = Utils.hardCheck(
        dlstore.getByID(completion.dailyLogID),
        'daily log from completion entry id was not found'
      )
      return Utils.d(log.logDate)
    },
    // todo: make these generic
    // problem is 'this' is possibly undefined
    async createItem(item: CompletionEntry) {
      await api
        .post('/completions', item, {
          headers: {},
          params: {},
        })
        .then((response) => {
          console.log('createItem response from backend: ', response)
          this.items.push(item)
        }, Utils.handleError('Error creating a completion entry'))
    },
    async fetchAll() {
      const response = await api.get('/completions', {
        headers: {},
        params: {},
      })
      this.items = response.data
    },
    async fetchItem(id: number) {
      const response = await api.get(`/completions/${id}`, {
        headers: {},
        params: {},
      })
      return response.data
    },
    async updateItem(item: CompletionEntry) {
      const index = this.items.findIndex((x) => x.id === item.id)
      if (index !== -1) {
        await api
          .patch(`/completions/${item.id}`, item, {
            headers: {},
          })
          .then((response) => {
            this.items[index] = { ...this.items[index], ...item }
            return response
          }, Utils.handleError('Error updating completion entry'))
      }
    },
    async deleteItem(id: number) {
      const index = this.items.findIndex((x) => x.id === id)
      if (index !== -1) {
        await api
          .delete(`/completions/${id}`, {
            headers: {},
          })
          .then((response) => {
            this.items.splice(index, 1)
            return response
          }, Utils.handleError('Error deleting completion entry'))
      }
    },
    async updateStatus(id: number, status?: 0 | 1 | 2) {
      const index = this.items.findIndex((x) => x.id === id)
      if (index !== -1) {
        const item: CompletionEntry = this.items[index]
        if (status) item.status = status
        else if (this.items[index].status !== 2) this.items[index].status = 2
        else this.items[index].status = 1
        await this.updateItem(this.items[index])
      }
    },
  },
})
