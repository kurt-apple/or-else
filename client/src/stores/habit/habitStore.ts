import { defineStore } from 'pinia'
import { PiniaGenerics, State, Record } from '../PiniaGenerics'
import { HasUser, useUsersStore } from '../user/userStore'
import { api } from 'src/boot/axios'
import {
  CompletionEntry,
  useCompletionsStore,
} from '../completion/completionStore'
import Utils from 'src/util'
import { useDailyLogsStore } from '../dailyLog/dailyLogStore'

export class Habit extends Record implements HasUser {
  userID?: number = undefined
  title = 'Untitled'

  static defaults() {
    const newHabit: Habit = {
      userID: useUsersStore().getUser().id,
      title: 'New Habit',
    }
    return newHabit
  }
}

export interface HasHabit extends Record {
  habitID?: number
}

export class HabitGenerics {
  static generateHabitGetters<R extends HasHabit>() {
    console.log('inside generateHabitGetters')
    return {
      habit:
        () =>
        (item: R): Habit | undefined => {
          return useHabitsStore().getByID(item.habitID)
        },
      allItemsForHabit: (state: State<R>) => (habitID: number) => {
        return state.items.filter((x) => x.habitID === habitID)
      },
    }
  }
}

export const useHabitsStore = defineStore('habits', {
  ...PiniaGenerics.stateTree<Habit>(),
  getters: {
    ...PiniaGenerics.generateStoreGetters<Habit>(),
    // ...UserGenerics.generateUserGetters<Habit>(),
    allItemsForUser: (state) => (userID: number) => {
      return state.items.filter((x) => x.userID === userID)
    },
    wasCompletedToday:
      () =>
      (habitID?: number): boolean => {
        if (typeof habitID === 'undefined')
          throw new Error('habit it was undefined')
        const completionStore = useCompletionsStore()
        const latestCompletion =
          completionStore.latestCompletionEntryForHabit(habitID)
        return latestCompletion.status === 2
      },
    times_sampled:
      () =>
      (id?: number): number => {
        if (typeof id === 'undefined') throw new Error('id was undefined')
        const completionStore = useCompletionsStore()
        const entries = completionStore.allItemsForHabit(id)
        return entries.filter((x) => x.status !== 0).length
      },
    times_completed:
      () =>
      (id?: number): number => {
        if (typeof id === 'undefined') throw new Error('id was undefined')
        const completionStore = useCompletionsStore()
        const entries: CompletionEntry[] = completionStore.allItemsForHabit(id)
        return entries.filter((x) => x.status === 2).length
      },
    latestDailyLog: () => (habitID: number) => {
      const completionStore = useCompletionsStore()
      const completion = completionStore.latestCompletionEntryForHabit(habitID)
      return Utils.hardCheck(
        useDailyLogsStore().getByID(completion.dailyLogID),
        'could not find daily log from latest completion entry of provided habit id'
      )
    },
  },
  actions: {
    times_completed_internal(id?: number) {
      // subtract latest log's status in order to prevent re-sampling
      const completionStore = useCompletionsStore()
      const latest = completionStore.latestCompletionEntryForHabit(id)
      const latestStatusFlag = latest.status === 2 ? 1 : 0
      return this.times_completed(id) - latestStatusFlag
    },
    completionRate(id?: number) {
      if (typeof id === 'undefined')
        throw new Error(
          'cannot find completion rate if the record does not have ID'
        )
      return this.times_sampled(id) === 0
        ? 0.0
        : this.times_completed_internal(id) / this.times_sampled(id)
    },
    priorCompletionRate(beforeDate: Date, habitID?: number) {
      Utils.hardCheck(habitID)
      if (new Date().getDate() === beforeDate.getDate())
        return this.completionRate(habitID)
      const completionStore = useCompletionsStore()
      let entries = completionStore.allItemsForHabit(habitID)
      entries = entries.filter((x: CompletionEntry) => {
        const log = Utils.hardCheck(
          useDailyLogsStore().getByID(x.dailyLogID),
          'no daily log found'
        )
        return Utils.d(log.logDate).getDate() < beforeDate.getDate()
      })
      const successes = entries.filter((x) => x.status === 2).length
      const sampled = entries.filter((x) => x.status !== 0).length
      return successes / sampled
    },
    roses(): Habit[] {
      const userStore = useUsersStore()
      const user = userStore.getUser()
      const threshold = user.completionRateThreshold
      return this.items.filter((x) => this.completionRate(x.id) > threshold)
    },

    thorns(): Habit[] {
      const dailyLogStore = useDailyLogsStore()
      const sortedHabits = this.items.sort(
        (a, b) => this.completionRate(a.id) - this.completionRate(b.id)
      )
      const latestLog = dailyLogStore.latestLog()
      return sortedHabits.slice(0, dailyLogStore.sampleRate(latestLog.id))
    },
    // todo: make these generic
    // problem is 'this' is possibly undefined
    async createItem(item: Habit) {
      await api
        .post('/habits', item, {
          headers: {},
          params: {},
        })
        .then((response) => {
          console.log('createItem response from backend: ', response)
          this.items.push(item)
        }, Utils.handleError('Error creating item.'))
      // const completionsStore = useCompletionsStore()
      // await completionsStore.fetchAll()
    },
    async fetchAll(): Promise<Habit[]> {
      const response = await api.get('/habits', {
        headers: {},
        params: {},
      })
      this.items = response.data
      return this.items
    },
    async fetchItem(id: number) {
      const response = await api.get(`/habits/${id}`, {
        headers: {},
        params: {},
      })
      return response.data
    },
    async updateItem(item: Habit) {
      const index = this.items.findIndex((x) => x.id === item.id)
      if (index !== -1) {
        await api
          .patch(`/habits/${item.id}`, item, {
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
          .delete(`/habits/${id}`, {
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
