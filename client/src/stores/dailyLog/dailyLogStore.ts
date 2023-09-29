import { defineStore } from 'pinia'
import { PiniaGenerics, Record, State } from 'src/stores/PiniaGenerics'
import { HasUser, useUsersStore } from 'src/stores/user/userStore'
import { useCompletionsStore } from '../completion/completionStore'
import { api } from 'src/boot/axios'
import Utils from 'src/util'
import { useHabitsStore } from '../habit/habitStore'
import { useWeightEntryStore } from '../weight-entry/weightEntryStore'
import { useFoodEntryStore } from '../foodEntry/foodEntryStore'
import { type } from 'os'

export class DailyLog extends Record implements HasUser {
  id?: number | undefined
  getID(): number {
    throw new Error('Method not implemented.')
  }

  userID = -1
  logDate = ''
  previousLogID?: number | undefined
  rationStoredValue: number | undefined
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
    this.rationStoredValue = options.rationStoredValue ?? 2000
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
          'the previous log id either does not exist yet or is set to bogus value'
        )
      }
      return state.items.find((x) => x.id === log.previousLogID)
    },
  },
  actions: {
    countCompleted(log: DailyLog) {
      return this.getCompletionEntries(log.id).filter((x) => x.status === 2)
        .length
    },
    successRate(log: DailyLog) {
      const completed = this.countCompleted(log)
      const habitsInPlay = this.getCompletionEntries(log.id).filter(
        (x) => x.status !== 0
      ).length
      return completed / habitsInPlay
    },
    maxWeight(log: DailyLog) {
      const entries = this.getWeightEntries(log.id).map((x) => x.weight)
      return Math.max(...entries)
    },
    weightDelta(log: DailyLog) {
      const previous = this.getByID(log.previousLogID)
      if (typeof previous === 'undefined') return 0
      const beforeThat = this.getByID(previous.previousLogID)
      if (typeof beforeThat === 'undefined') return 0
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
    calculateBaseRation(log: DailyLog) {
      const user = useUsersStore().gimmeUser(log.userID)
      // 1. get previous ration or default to user starting ration
      // 1.a. get previous logs
      const priorLogs = this.items
        .filter((x) => Utils.d(x.logDate) < Utils.d(log.logDate))
        .sort((a, b) => Utils.mddl(a, b, 'asc'))
      priorLogs.push(log)
      // 1.b. tail it
      for (let i = 0; i < priorLogs.length; i++) {
        if (typeof priorLogs[i].previousLogID === 'undefined') {
          // not sure where to take the database-backed optimization of this query.
          // todo: optimize, perhaps with a 'dirty' flag to indicate which need to be recalculated
          // for now, recalculate all
          priorLogs[i].rationStoredValue = user.startingRation
          priorLogs[i].lastModified = new Date().toISOString()
        } else {
          const previousRation = Utils.hardCheck(
            this.previousLog(priorLogs[i])?.rationStoredValue,
            'previous log not found'
          )
          // todo: validate previous log has an up to date value etc etc
          let newRation = previousRation ?? user.startingRation
          if (this.weightDelta(priorLogs[i]) > 0) newRation -= 100
          // todo: add weight status as default habit, auto-tracked
          // todo: add calorie count status as default habit, auto-tracked
          else {
            newRation += 100
          }
          priorLogs[i].rationStoredValue = newRation
          priorLogs[i].lastModified = new Date().toISOString()
        }
      }

      // 2. if auto size base ration: if weight up, reduce by x; else increase by x
      // todo: make this a toggle. Currently only enabled.
      // todo: have a min weight user setting. If below min weight, add calories no matter the delta
      // if at min weight, do not change ration
      // 3. compute total completed / total sampled for previous day
      // 4. multiply base ration by completion ratio
      const ration = priorLogs.pop()?.rationStoredValue
      if (typeof ration === 'undefined') {
        console.warn('ration is undefined.')
        return user.startingRation
      } else return ration
    },
    calculateActualRation(log: DailyLog) {
      const base = this.calculateBaseRation(log)
      if (typeof log.previousLogID === 'undefined') {
        return base
      } else {
        const prev = Utils.hardCheck(
          this.previousLog(log),
          'should have returned previous log object'
        )
        return base * this.successRate(prev)
      }
    },
    async reSampleHabits(dailyLogID?: number) {
      if (typeof dailyLogID === 'undefined')
        throw new Error('resample failed because id was undefined.')

      const dailyLog = Utils.hardCheck(
        this.items.find((x) => x.id === dailyLogID),
        'daily log does not come up by this id'
      )
      console.log('RE-SAMPLING DAILY LOG ', this.formattedDate(dailyLog))
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
        const completionEntriesOfHabit = completionStore
          .allItemsForHabit(habits[i].id)
          .filter((y) => y.dailyLogID === dailyLog.id)
        for (let j = 0; j < completionEntriesOfHabit.length; j++) {
          completionEntriesOfHabit[j].status = 1
          await useCompletionsStore().updateItem(completionEntriesOfHabit[j])
        }
      }
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
