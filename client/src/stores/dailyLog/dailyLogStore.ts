import { defineStore } from 'pinia'
import { PiniaGenerics, Record, State } from 'src/stores/PiniaGenerics'
import { HasUser, useUsersStore } from 'src/stores/user/userStore'
import {
  CompletionEntry,
  habitStatus,
  sampleType,
  useCompletionsStore,
} from '../completion/completionStore'
import { api } from 'src/boot/axios'
import Utils from 'src/util'
import { useHabitsStore } from '../habit/habitStore'
import { useWeightEntryStore } from '../weight-entry/weightEntryStore'
import { useFoodEntryStore } from '../foodEntry/foodEntryStore'

export class DailyLog extends Record implements HasUser {
  id?: number
  userID?: number = undefined
  logDate = ''
  previousLogID?: number = undefined
  baseRation?: number = undefined
  lastModified?: string
  constructor(options: {
    userID?: number
    logDate?: string
    previousLogID?: number
    baseRation?: number
    lastModified?: string
  }) {
    super({})
    this.userID = options.userID
    this.logDate = options.logDate ?? ''
    this.previousLogID = options.previousLogID
    this.baseRation = options.baseRation ?? 2000
    this.lastModified = options.lastModified ?? new Date().toISOString()
  }
}

export interface HasDailyLog extends Record {
  dailyLogID?: number
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
    // ...UserGenerics.generateUserGetters<DailyLog>(),
    allDesc: (state) => () => {
      return state.items.sort((a, b) => Utils.mddl(a, b, 'desc'))
    },
    allAsc: (state) => () => {
      return state.items.sort((a, b) => Utils.mddl(a, b, 'asc'))
    },
    formattedDate: () => (item: DailyLog) => {
      return new Date(item.logDate).toLocaleDateString()
    },
    getDateFromLog:
      () =>
      (item: DailyLog): Date => {
        return Utils.d(item.logDate)
      },
    getWeightEntries: () => (dailyLogID?: number) => {
      if (typeof dailyLogID === 'undefined')
        throw new Error('daily log id is undefined')
      return useWeightEntryStore().allItemsForDailyLog(dailyLogID)
    },
    getCompletionEntries: () => (DailyLogID?: number) => {
      if (typeof DailyLogID === 'undefined')
        throw new Error('daily log id is undefined')
      return useCompletionsStore().allItemsForDailyLog(DailyLogID)
    },
    allFoodEntries: () => (dailyLogID?: number) => {
      if (typeof dailyLogID === 'undefined')
        throw new Error('daily log ID is undefined')
      return useFoodEntryStore().allItemsForDailyLog(dailyLogID)
    },
    previousLog: (state) => (log: DailyLog) => {
      if (
        typeof log.previousLogID === 'undefined' ||
        log.previousLogID === null ||
        log.previousLogID < 1
      ) {
        throw new Error(
          `the previous log id either does not exist yet or is set to bogus value - ${log.previousLogID}`
        )
      }
      return Utils.hardCheck(
        state.items.find((x) => x.id === log.previousLogID),
        'no previous log found'
      )
    },
    queryDate: (state) => (dateStr: string) => {
      return state.items.find((x) => Utils.same24s(x.logDate, dateStr))
    },
    allLogsPrior: (state) => (log: DailyLog) => {
      return state.items.filter(
        (x) => Utils.d(log.logDate).getTime() > Utils.d(x.logDate).getTime()
      )
    },
    allLogsAfter: (state) => (log: DailyLog) => {
      const after = state.items.filter(
        (x) => Utils.d(log.logDate).getTime() < Utils.d(x.logDate).getTime()
      )
      return after
    },
    nextLog:
      (state) =>
      (log: DailyLog): DailyLog => {
        return state.items
          .filter(
            (x) => Utils.d(log.logDate).getTime() < Utils.d(x.logDate).getTime()
          )
          .sort((a, b) => Utils.mddl(a, b, 'asc'))[0]
      },
  },
  actions: {
    qtyImprovedHabits(logID?: number) {
      if (typeof logID === 'undefined')
        throw new Error('cannot do math on undefined record')
      const log = Utils.hardCheck(this.getByID(logID))
      const completed = useCompletionsStore().getCompletedFromLog(logID)
      const threshold = useUsersStore().getUser().completionRateThreshold
      const habitStore = useHabitsStore()
      return completed.filter(
        (x) =>
          habitStore.completionRateOnDate(
            Utils.hardCheck(habitStore.getByID(x.habitID)),
            log.logDate
          ) <= threshold
      ).length
    },
    topPerformersForDate(log: DailyLog) {
      const habitsStore = useHabitsStore()
      const threshold = useUsersStore().getUser().completionRateThreshold
      const tp = habitsStore
        .allHabitsOnOrBeforeDate(log.logDate)
        .filter(
          (x) => habitsStore.completionRateOnDate(x, log.logDate) >= threshold
        )
      return this.getCompletionEntries(log.id).filter(
        (x) => typeof tp.find((y) => x.habitID === y.id) !== 'undefined'
      )
    },
    latestLog(): DailyLog {
      return Utils.hardCheck(
        this.items.sort((a, b) => Utils.mddl(a, b, 'desc'))[0]
      )
    },
    mapZeroToUndefined(item: DailyLog) {
      if (item.userID === 0) item.userID = undefined
      if (item.previousLogID === 0) item.previousLogID = undefined
      return item
    },
    countCompleted(log: DailyLog) {
      return this.getCompletionEntries(log.id).filter(
        (x) => x.status === habitStatus.COMPLETED
      ).length
    },
    successRate(log: DailyLog, includeRation = false) {
      let completed = this.countCompleted(log)
      if (includeRation) completed += this.rationProgress(log) > 1 ? 0 : 1
      const habitsInPlay =
        this.getCompletionEntries(log.id).filter(
          (x) => x.status !== habitStatus.UNSPECIFIED
        ).length + (includeRation ? 1 : 0)
      const rate =
        completed === 0 || habitsInPlay === 0 ? 0 : completed / habitsInPlay

      return rate
    },
    maxWeight(log: DailyLog): number {
      const entries = this.getWeightEntries(log.id).map((x) => x.weight)
      if (entries.length === 0) {
        if (log.previousLogID) {
          const previous = this.getByID(log.previousLogID)
          if (typeof previous !== 'undefined') {
            return this.maxWeight(previous)
          }
        }
        return useUsersStore().getUser().startingWeight
      }
      return Math.max(...entries)
    },
    weightDelta(log: DailyLog, previous?: DailyLog) {
      if (typeof previous === 'undefined') {
        if (typeof log.previousLogID === 'undefined') return 0
        previous = this.previousLog(log)
      }
      if (
        typeof previous.previousLogID === 'undefined' ||
        previous.previousLogID === null ||
        previous.previousLogID < 1
      ) {
        return 0
      }
      const beforeThat = this.previousLog(previous)
      return this.maxWeight(previous) - this.maxWeight(beforeThat)
    },
    totalCaloriesConsumed(dailyLogID?: number) {
      const foodEntryStore = useFoodEntryStore()
      const entries = this.allFoodEntries(dailyLogID)
      let sum = 0
      for (let i = 0; i < entries.length; i++) {
        sum += foodEntryStore.totalCalories(entries[i])
      }
      return sum
    },
    rationProgress(log: DailyLog) {
      const consumed = this.totalCaloriesConsumed(log.id)
      const ration = this.calculateActualRation(log)
      return consumed / ration
    },
    sampleRate(dailyLogID?: number): number {
      Utils.hardCheck(dailyLogID)
      const log = Utils.hardCheck(
        this.getByID(dailyLogID),
        'daily log id provided did not work'
      )
      const user = useUsersStore().getUser()
      if (typeof log.previousLogID === 'undefined') {
        return user.startingSampleRate
      } else {
        const prevImproved = this.qtyImprovedHabits(log.previousLogID)
        const sampleRate = Math.max(prevImproved + 1, user.startingSampleRate)
        return sampleRate
      }
    },
    lowPerformersForDate(log: DailyLog) {
      const habitsStore = useHabitsStore()
      const sr = this.sampleRate(log.id)
      const cs = useCompletionsStore()
      const habitsLP = habitsStore
        .allHabitsOnOrBeforeDate(log.logDate)
        .sort((a, b) => {
          let crcomp =
            habitsStore.completionRateOnDate(a, log.logDate) -
            habitsStore.completionRateOnDate(b, log.logDate)
          if (crcomp === 0)
            crcomp =
              cs.totalTimesSampledBeforeDate(b, log.logDate) -
              cs.totalTimesSampledBeforeDate(a, log.logDate)
          if (crcomp === 0) crcomp = (a.id ?? 0) - (b.id ?? 0)
          return crcomp
        })
        .slice(0, sr)
      return this.getCompletionEntries(log.id).filter(
        (x) => typeof habitsLP.find((y) => x.habitID === y.id) !== 'undefined'
      )
    },
    calculateBaseRation(log: DailyLog): number {
      const user = useUsersStore().getUser()
      if (typeof log.previousLogID === 'undefined') {
        log.baseRation = user.startingRation
        return Math.max(user.startingRation, user.minRation)
      }

      const previousLog = this.previousLog(log)
      const baseRation =
        typeof previousLog.baseRation === 'undefined'
          ? this.calculateBaseRation(previousLog)
          : previousLog.baseRation
      // weight
      const delta = this.weightDelta(log)
      const weight = this.maxWeight(previousLog)
      const minWeight = user.minWeight

      if (weight < minWeight) {
        log.baseRation = baseRation + 100
        return Math.max(baseRation + 100, user.minRation)
      } else {
        if (delta > 0) {
          log.baseRation = Math.max(baseRation - 100, user.minRation)
        } else if (delta < 0) {
          log.baseRation = Math.max(baseRation + 100, user.minRation)
        } else {
          return baseRation
        }
        return log.baseRation
      }
    },
    async refreshAllBaseRations(): Promise<void> {
      Utils.todo()
      const allLogs = this.allAsc()
      for (let i = 0; i < allLogs.length; i++) {
        this.calculateBaseRation(allLogs[i])
        await this.updateItem(allLogs[i])
      }
    },
    calculateActualRation(log: DailyLog) {
      const base = this.calculateBaseRation(log)
      const user = useUsersStore().getUser()
      let previous: DailyLog
      try {
        previous = this.previousLog(log)
      } catch (e) {
        return user.startingRation
      }
      return Math.round(
        Math.max(user.minRation, base * this.successRate(previous, true))
      )
    },
    async flagTopPerformersForLog(log: DailyLog) {
      const completionStore = useCompletionsStore()
      const threshold = useUsersStore().threshold()
      const hs = useHabitsStore()
      const entries = this.getCompletionEntries(log.id).filter(
        (x) =>
          hs.completionRateOnDate(
            Utils.hardCheck(hs.getByID(x.habitID)),
            log.logDate
          ) >= threshold
      )
      entries.forEach(async (x) => {
        x.sampleType = sampleType.TOPPERFORMER
        x.status =
          x.status === habitStatus.COMPLETED
            ? habitStatus.COMPLETED
            : habitStatus.NOTCOMPLETED
        await completionStore.updateItem(x)
      })
    },
    async resetIncompleteSampledFromLog(dailyLogID: number) {
      const completionStore = useCompletionsStore()
      const incompleteSampled = completionStore
        .allItemsForDailyLog(dailyLogID)
        .filter(
          (x) =>
            x.sampleType !== sampleType.NOTSAMPLED &&
            x.status !== habitStatus.COMPLETED
        )
      incompleteSampled.forEach(async (x) => {
        x.sampleType = sampleType.NOTSAMPLED
        x.status = habitStatus.UNSPECIFIED
        await completionStore.updateItem(x)
      })
    },
    countSampledOfDailyLog(dailyLogID: number) {
      const completionStore = useCompletionsStore()
      const sampled = completionStore
        .allItemsForDailyLog(dailyLogID)
        .filter((x) => x.sampleType !== sampleType.NOTSAMPLED)
        .filter((x) => x.status === habitStatus.COMPLETED)
      return sampled.length
    },
    unsampleAll(entries: CompletionEntry[]) {
      entries.forEach((x) => {
        x.sampleType = sampleType.NOTSAMPLED
      })
    },

    // todo: write tests
    // 1. resampling the earliest daily log should not change the qty of sampled tasks from the base sample rate
    async reSample(log: DailyLog): Promise<void> {
      if (typeof log === 'undefined') return
      console.log('reSampling ', new Date(log.logDate).toDateString())
      console.log('sample rate: ', this.sampleRate(log.id))

      const allCompletionEntries = this.getCompletionEntries(log.id)
      // need to replace unsample all with a new system:
      // get list of top performers
      const tp = this.topPerformersForDate(log) // todo: refactor so it spits out entries instead of habits
      // get list of low performers
      const lp = this.lowPerformersForDate(log) // todo: refactor so it spits out entries instead of habits
      if (Utils.d(log.logDate).getDate() === 6) console.log('lp: ', lp)
      // for any current top performer that is no longer, reset it
      const currentTP = allCompletionEntries.filter(
        (x) => x.sampleType === sampleType.TOPPERFORMER
      )
      currentTP
        .filter((x) => typeof tp.find((y) => y.id === x.id) === 'undefined')
        .forEach((x) => {
          x.sampleType = sampleType.NOTSAMPLED
          if (x.status !== habitStatus.COMPLETED) {
            x.status = habitStatus.UNSPECIFIED
          }
        })
      // for any current low performer that is no longer, reset it
      const currentLP = allCompletionEntries.filter(
        (x) => x.sampleType === sampleType.NEEDSWORK
      )
      currentLP
        .filter((x) => typeof lp.find((y) => y.id === x.id) === 'undefined')
        .forEach((x) => {
          x.sampleType = sampleType.NOTSAMPLED
          if (x.status !== habitStatus.COMPLETED) {
            x.status = habitStatus.UNSPECIFIED
          }
        })
      // sample new lp and tp
      lp.forEach((x) => {
        x.sampleType = sampleType.NEEDSWORK
        if (x.status === habitStatus.UNSPECIFIED) {
          x.status = habitStatus.NOTCOMPLETED
        }
      })
      tp.forEach((x) => {
        x.sampleType = sampleType.TOPPERFORMER
        if (x.status === habitStatus.UNSPECIFIED) {
          x.status = habitStatus.NOTCOMPLETED
        }
      })
      // try to preserve sample rate of next dailylog to avoid churn
      // recalculate base ration because why not
      this.calculateBaseRation(log)

      const nextLog = this.nextLog(log)
      if (typeof nextLog !== 'undefined') await this.reSample(nextLog)
    },

    async createItem(item: DailyLog) {
      let newItem: DailyLog
      await api
        .post('/daily-logs', item, {
          headers: {},
          params: {},
        })
        .then(async (response) => {
          console.log('createItem response from backend: ', response)
          newItem = this.mapZeroToUndefined(response.data)
          this.items.push(newItem)
          const hs = useHabitsStore()
          const cs = useCompletionsStore()
          const currentHabits = hs.allHabitsOnOrBeforeDate(newItem.logDate)
          currentHabits.forEach(async (x) => {
            const newEntry: CompletionEntry = {
              habitID: x.id,
              dailyLogID: newItem.id,
              status: habitStatus.UNSPECIFIED,
              sampleType: sampleType.NOTSAMPLED,
            }
            await cs.createItem(newEntry)
          })
          await this.reSample(newItem)
        }, Utils.handleError('Error creating item.'))
    },
    async fetchAll() {
      const response = await api.get('/daily-logs', {
        headers: {},
        params: {},
      })
      this.items = response.data
      for (let i = 0; i < this.items.length; i++) {
        this.items[i] = this.mapZeroToUndefined(this.items[i])
      }
    },
    async fetchItem(id: number) {
      const response = await api.get(`/daily-logs/${id}`, {
        headers: {},
        params: {},
      })
      return this.mapZeroToUndefined(response.data)
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
    async deleteItem(id?: number) {
      if (typeof id === 'undefined')
        throw new Error('cannot delete undefined. skill issue lol')
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
