import { defineStore } from 'pinia'
import { PiniaGenerics, Record, State } from 'src/stores/PiniaGenerics'
import { HasUser, useUsersStore } from 'src/stores/user/userStore'
import { useCompletionsStore } from '../completion/completionStore'
import { api } from 'src/boot/axios'
import Utils from 'src/util'
import { useHabitsStore } from '../habit/habitStore'
import { useWeightEntryStore } from '../weight-entry/weightEntryStore'
import { useFoodEntryStore } from '../foodEntry/foodEntryStore'

export class DailyLog extends Record implements HasUser {
  id?: number | undefined
  getID(): number {
    throw new Error('Method not implemented.')
  }

  userID = -1
  logDate = ''
  previousLogID?: number | undefined
  baseRation: number | undefined
  lastModified?: string | undefined
  constructor(options: {
    userID?: number
    logDate?: string
    previousLogID?: number | undefined
    rationStoredValue?: number | undefined
    lastModified?: string
  }) {
    super({})
    this.userID = options.userID ?? -1
    this.logDate = options.logDate ?? ''
    this.previousLogID = options.previousLogID
    this.baseRation = options.rationStoredValue ?? 2000
    this.lastModified = options.lastModified ?? new Date().toISOString()
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
    // ...UserGenerics.generateUserGetters<DailyLog>(),
    allDesc: (state) => () => {
      return state.items.sort((a, b) => Utils.mddl(a, b, 'desc'))
    },
    allAsc: (state) => () => {
      return state.items.sort((a, b) => Utils.mddl(a, b, 'asc'))
    },
    allItemsForUser: (state) => (userID?: number) => {
      if (typeof userID === 'undefined')
        throw new Error('cannot fetch related records of undefined')
      return state.items.filter((x) => x.userID === userID)
    },
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
    qtyImprovedHabits: () => (logID?: number, userID?: number) => {
      if (typeof logID === 'undefined')
        throw new Error('cannot do math on undefined record')
      const completionStore = useCompletionsStore()
      const completed = completionStore.getCompletedFromLog(logID)
      const userStore = useUsersStore()
      const user = userStore.gimmeUser(userID)
      const habitStore = useHabitsStore()
      return completed.filter(
        (x) =>
          habitStore.completionRate(x.habitID) <= user.completionRateThreshold
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
    getUserFromLog: () => (log?: DailyLog) => {
      if (typeof log === 'undefined')
        throw new Error('cannot retrieve related records of undefined')
      const userStore = useUsersStore()
      return Utils.hardCheck(
        userStore.getByID(log.userID),
        'user not found for dailylog'
      )
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
      return state.items.filter(
        (x) => Utils.d(log.logDate).getTime() < Utils.d(x.logDate).getTime()
      )
    },
  },
  actions: {
    countCompleted(log: DailyLog) {
      return this.getCompletionEntries(log.id).filter((x) => x.status === 2)
        .length
    },
    successRate(log: DailyLog, includeRation = false) {
      let completed = this.countCompleted(log)
      if (includeRation) completed += this.rationProgress(log) > 1 ? 0 : 1
      const habitsInPlay =
        this.getCompletionEntries(log.id).filter((x) => x.status !== 0).length +
        (includeRation ? 1 : 0)
      const rate =
        completed === 0 || habitsInPlay === 0 ? 0 : completed / habitsInPlay

      return rate
    },
    maxWeight(log: DailyLog): number {
      const user = useUsersStore().gimmeUser(log.userID)
      const entries = this.getWeightEntries(log.id).map((x) => x.weight)
      const previous = this.getByID(log.previousLogID)
      if (entries.length > 0) return Math.max(...entries)
      if (typeof previous === 'undefined') return user.minWeight
      else return this.maxWeight(previous)
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
      return this.maxWeight(beforeThat) - this.maxWeight(previous)
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
    calculateBaseRation(log: DailyLog): number {
      const user = this.getUserFromLog(log)
      if (
        typeof log.previousLogID === 'undefined' ||
        log.previousLogID === null ||
        log.previousLogID < 1
      ) {
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
      if (delta > 0 && weight > minWeight) {
        log.baseRation = baseRation - 100
        return Math.max(baseRation - 100, user.minRation)
      }

      log.baseRation = baseRation + 100
      return Math.max(baseRation + 100, user.minRation)
    },
    async refreshAllBaseRations(): Promise<void> {
      const allLogs = this.allAsc()
      for (let i = 0; i < allLogs.length; i++) {
        this.calculateBaseRation(allLogs[i])
        await this.updateItem(allLogs[i])
      }
    },
    calculateActualRation(log: DailyLog) {
      const base = this.calculateBaseRation(log)
      const user = useUsersStore().gimmeUser(log.userID)
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
    async reSampleHabits(logID?: number) {
      // sanity checks
      if (typeof logID === 'undefined') throw new Error('log id is undefined')
      const log = Utils.hardCheck(this.getByID(logID), 'could not get log')
      console.log('RE-SAMPLING DAILY LOG ', this.formattedDate(log))
      // all the stores
      const completionStore = useCompletionsStore()
      const habitStore = useHabitsStore()
      // if the log is being resampled, get habits sampled yet incomplete and reset them:
      // a. sampled -> false
      // b. status -> 0 (back to indeterminate)
      const resetIncompleteSampledFromLog = async (dailyLogID: number) => {
        const incompleteSampled = completionStore
          .allItemsForDailyLog(dailyLogID)
          .filter((x) => (x.sampled && x.status !== 2) || x.status === 1)
        incompleteSampled.forEach((x) => {
          x.sampled = false
          x.status = 0
        })
      }
      await resetIncompleteSampledFromLog(logID)
      // easy out: calculate how many more habits are needed to be sampled based on the number of complete sampled habits
      const countSampledOfDailyLog = (dailyLogID: number) => {
        const sampled = completionStore
          .allItemsForDailyLog(dailyLogID)
          .filter((x) => x.sampled)
        return sampled.length
      }
      const countSampled = countSampledOfDailyLog(logID)
      const remainingNeeded = this.sampleRate(logID) - countSampled
      if (remainingNeeded <= 0) return
      // collect incomplete habit entries for the log, sort by completion rate
      const notcompleted = completionStore
        .getFailedOrUnspecifiedFromLog(logID)
        .sort(
          (a, b) =>
            habitStore.completionRate(a.habitID) -
            habitStore.completionRate(b.habitID)
        )
      // set just the remaining needed to 'sampled'
      const remainingToSample = notcompleted.slice(0, remainingNeeded)
      remainingToSample.forEach(async (x) => {
        x.sampled = true
        x.status = 1
        await completionStore.updateItem(x)
      })
      // re sample any logs after this one
      const logsAfter = this.allLogsAfter(log).sort((a, b) =>
        Utils.mddl(a, b, 'asc')
      )
      logsAfter.forEach(async (x) => await this.reSampleHabits(x.id))
    },
    async reSampleHabitsGivenDate(fromDate: Date) {
      const toReSample = this.items
        .filter((x) => Utils.t(x.logDate) > fromDate.getTime())
        .sort((a, b) => Utils.mddl(a, b, 'asc'))
      toReSample.forEach(async (x) => await this.reSampleHabits(x.id))
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
