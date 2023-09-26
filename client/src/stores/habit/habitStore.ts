import { defineStore } from 'pinia'
import { PiniaGenerics, State, Record } from '../PiniaGenerics'
import { HasUser, useUsersStore } from '../user/userStore'
import { api } from 'src/boot/axios'
import {
  CompletionEntry,
  useCompletionsStore,
} from '../completion/completion-store'
import Utils from 'src/util'
import { useDailyLogsStore } from '../daily-log/daily-log-store'

export class Habit extends Record implements HasUser {
  userID = -1
  title = 'Untitled'
  get completionEntries(): CompletionEntry[] {
    return useCompletionsStore().allItemsForHabit(
      Utils.hardCheck(
        this.id,
        'fetching records by associated habit ID before habit record has ID'
      )
    )
  }
}

export interface HasHabit extends Record {
  habitID: number
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
        return (
          Utils.hardCheck(
            latestCompletion,
            'could not find latest completion entry for habit'
          ).status === 2
        )
      },
    times_sampled:
      () =>
      (id?: number): number => {
        if (typeof id === 'undefined') throw new Error('id was undefined')
        const completionStore = useCompletionsStore()
        const entries = Utils.hardCheck(
          completionStore.allItemsForHabit(id),
          'cannot find completion entries for the habit id provided'
        )
        const latest = Utils.hardCheck(
          completionStore.latestCompletionEntryForHabit(id),
          'cannot find latest entry for habit'
        )
        return entries.filter((x) => x.status !== 0).length - latest.status !==
          0
          ? 1
          : 0
      },
    times_completed: () => (id?: number) => {
      if (typeof id === 'undefined') throw new Error('id was undefined')
      const completionStore = useCompletionsStore()
      const latest = Utils.hardCheck(
        completionStore.latestCompletionEntryForHabit(id),
        'could not find completion entry for the provided habit id'
      )
      const entries: CompletionEntry[] = Utils.hardCheck(
        completionStore.allItemsForHabit(id),
        'could not find any completion entries for the provided habit id'
      )
      return entries.filter((x) => x.status === 2).length - latest.status === 2
        ? 1
        : 0
    },
    latestDailyLog: () => (habitID: number) => {
      const completionStore = useCompletionsStore()
      const completion = Utils.hardCheck(
        completionStore.latestCompletionEntryForHabit(habitID),
        'could not find latest completion entry for provided habit id'
      )
      const logStore = useDailyLogsStore()
      const log = logStore.getByID(completion?.dailyLogID)
      return Utils.hardCheck(
        log,
        'could not find daily log from latest completion entry of provided habit id'
      )
    },
  },
  actions: {
    completionRate(id?: number) {
      if (typeof id === 'undefined')
        throw new Error(
          'cannot find completion rate if the record does not have ID'
        )
      return this.times_sampled(id) === 0
        ? 0.0
        : this.times_completed(id) / this.times_sampled(id)
    },
    priorCompletionRate(beforeDate: Date, habitID?: number) {
      const hID = Utils.hardCheck(
        habitID,
        'habitID is undefined at priorCompletionRate function'
      )
      if (new Date().getDate() === beforeDate.getDate())
        return this.completionRate(hID)
      const completionStore = useCompletionsStore()
      let entries = completionStore.allItemsForHabit(hID)
      entries = entries.filter(
        (x: CompletionEntry) =>
          new Date(x.dateValue).getDate() < beforeDate.getDate()
      )
      const successes = entries.filter((x) => x.status === 2).length
      const sampled = entries.filter((x) => x.status !== 0).length
      return successes / sampled
    },
    roses(userID?: number) {
      const userStore = useUsersStore()
      const user = userStore.gimmeUser(userID)
      const threshold = user.completionRateThreshold
      return this.items.filter((x) => this.completionRate(x.id) > threshold)
    },

    thorns(userID?: number) {
      const userStore = useUsersStore()
      const dailyLogStore = useDailyLogsStore()
      const user = userStore.gimmeUser(userID)
      const sortedHabits = this.items.sort(
        (a, b) => this.completionRate(a.id) - this.completionRate(b.id)
      )
      const latestLog = dailyLogStore.latestLog(user.id)
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
    },
    async fetchAll() {
      const response = await api.get('/habits', {
        headers: {},
        params: {},
      })
      this.items = response.data
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
