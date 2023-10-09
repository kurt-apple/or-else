import { defineStore } from 'pinia'
import { HasDailyLog, useDailyLogsStore } from '../dailyLog/dailyLogStore'
import { PiniaGenerics, Record } from '../PiniaGenerics'
import {
  Habit,
  /* HabitGenerics, */ HasHabit,
  useHabitsStore,
} from '../habit/habitStore'
import { api } from 'src/boot/axios'
import Utils from 'src/util'

export enum habitStatus {
  UNSPECIFIED = 0,
  NOTCOMPLETED = 1,
  COMPLETED = 2,
}

export enum sampleType {
  NOTSAMPLED = 0,
  NEEDSWORK = 1,
  TOPPERFORMER = 2,
}

export class CompletionEntry extends Record implements HasDailyLog, HasHabit {
  habitID?: number = undefined
  dailyLogID?: number = undefined
  status: habitStatus = habitStatus.UNSPECIFIED
  sampleType: sampleType = sampleType.NOTSAMPLED

  static defaults(): CompletionEntry {
    const temp: CompletionEntry = {
      habitID: undefined,
      dailyLogID: undefined,
      status: habitStatus.UNSPECIFIED,
      sampleType: sampleType.NOTSAMPLED,
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
        Utils.hardCheck(habitID)
        const latestLog = useDailyLogsStore().latestLog()
        const entriesOfLatestLog: CompletionEntry[] = state.items.filter(
          (x) => x.dailyLogID === latestLog.id
        )
        if (entriesOfLatestLog.length === 0)
          throw new Error(
            'trying to find latest completion entry for a habit but there are no entries'
          )
        return Utils.hardCheck(
          entriesOfLatestLog.find((x) => x.habitID === habitID),
          `completion entry from latest log was not found for habit id ${habitID}`
        )
      },
    isSampled:
      () =>
      (entry: CompletionEntry): boolean => {
        // console.log('sample type: ', entry.sampleType)
        return entry.sampleType !== sampleType.NOTSAMPLED
      },
    getCompletedFromLog: (state) => (logID: number) => {
      return state.items
        .filter((x) => x.dailyLogID === logID)
        .filter((x) => x.status === habitStatus.COMPLETED)
    },
    getFailedFromLog: (state) => (logID: number) => {
      return state.items
        .filter((x) => x.dailyLogID === logID)
        .filter((x) => x.status === habitStatus.NOTCOMPLETED)
    },
    getFailedOrUnspecifiedFromLog: (state) => (logID: number) => {
      return state.items
        .filter((x) => x.dailyLogID === logID)
        .filter((x) => x.status !== habitStatus.COMPLETED)
    },
    getIncompleteSampledFromLog: (state) => (logID: number) => {
      return state.items
        .filter((x) => x.dailyLogID === logID)
        .filter((x) => x.sampleType !== sampleType.NOTSAMPLED)
        .filter((x) => x.status !== habitStatus.COMPLETED)
    },
    getUnsampledUnspecifiedFromLog: (state) => (logID: number) => {
      return state.items
        .filter((x) => x.dailyLogID === logID)
        .filter((x) => x.sampleType === sampleType.NOTSAMPLED)
        .filter((x) => x.status === habitStatus.UNSPECIFIED)
    },
    getHabit: () => (c: CompletionEntry) => {
      const habitStore = useHabitsStore()
      return habitStore.getByID(c.habitID)
    },
  },
  actions: {
    resetFailedFromLog(logID: number) {
      this.getFailedFromLog(logID).forEach((x) => {
        x.status = habitStatus.UNSPECIFIED
      })
    },
    resetIncompleteSampledFromLog(logID: number) {
      const incompleteSampled = this.getIncompleteSampledFromLog(logID)
      incompleteSampled.forEach(async (x) => {
        x.status = habitStatus.UNSPECIFIED
        x.sampleType = sampleType.NOTSAMPLED
        await this.updateItem(x)
      })
    },
    allItemsForHabit(habitID?: number) {
      if (typeof habitID === 'undefined')
        throw new Error('cannot find items based on undefined habit id')
      return this.items.filter((x) => x.habitID === habitID)
    },
    allEntriesForHabitPriorTo(
      habit: Habit,
      dateStr: string
    ): CompletionEntry[] {
      const dailyLogStore = useDailyLogsStore()
      const dailyLogAtDate = Utils.hardCheck(dailyLogStore.queryDate(dateStr))
      return dailyLogStore
        .allLogsPrior(dailyLogAtDate)
        .flatMap((x) => this.EntryFromDailyLogForHabit(x.id, habit.id))
    },
    allItemsForDailyLog(dailyLogID?: number) {
      if (typeof dailyLogID === 'undefined')
        throw new Error('cannot do math on undefined id')
      return this.items.filter((x) => x.dailyLogID === dailyLogID)
    },
    EntryFromDailyLogForHabit(
      dailyLogID?: number,
      habitID?: number
    ): CompletionEntry {
      Utils.hardCheck(dailyLogID)
      Utils.hardCheck(habitID)
      return Utils.hardCheck(
        this.items
          .filter((x) => x.dailyLogID === dailyLogID)
          .find((x) => x.habitID === habitID)
      )
    },
    dateValueFromDailyLog(completionEntryID?: number) {
      Utils.hardCheck(completionEntryID)
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
    totalTimesSampledBeforeDate(habit: Habit, dateStr: string) {
      const dls = useDailyLogsStore()
      const dlAtDate = Utils.hardCheck(dls.queryDate(dateStr))
      const entriesBeforeDate = dls
        .allLogsPrior(dlAtDate)
        .flatMap((x) => dls.getCompletionEntries(x.id))
      return entriesBeforeDate
        .filter((x) => x.habitID === habit.id)
        .filter((x) => x.sampleType !== sampleType.NOTSAMPLED).length
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
    mapZeroToUndefined(item: CompletionEntry) {
      if (item.dailyLogID === 0) item.dailyLogID = undefined
      if (item.habitID === 0) item.habitID = undefined
      return item
    },
    async fetchAll() {
      const response = await api.get('/completions', {
        headers: {},
        params: {},
      })
      this.items = response.data
      for (let i = 0; i < this.items.length; i++) {
        this.items[i] = this.mapZeroToUndefined(this.items[i])
      }
      return this.items
    },
    async fetchItem(id: number) {
      const response = await api.get(`/completions/${id}`, {
        headers: {},
        params: {},
      })
      return this.mapZeroToUndefined(response.data)
    },
    // NOT the responsibility of this function to kick off a resample of the daily logs
    async updateItem(item: CompletionEntry) {
      const index = this.items.findIndex((x) => x.id === item.id)
      if (index !== -1) {
        await api
          .patch(`/completions/${item.id}`, item, {
            headers: {},
          })
          .then(async (response) => {
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
    // THIS is the function that will kick off a resample.
    async updateStatus(item: CompletionEntry, status?: habitStatus) {
      if (typeof status !== 'undefined') {
        item.status = status
      } else if (item.status !== habitStatus.COMPLETED) {
        item.status = habitStatus.COMPLETED
      } else {
        item.status = habitStatus.NOTCOMPLETED
      }
      console.log('updateStatus: status is now ', item.status)
      await this.updateItem(item)
      const dls = useDailyLogsStore()
      const dailyLog = Utils.hardCheck(dls.getByID(item.dailyLogID))
      await useDailyLogsStore().reSample(dailyLog)
    },
  },
})
