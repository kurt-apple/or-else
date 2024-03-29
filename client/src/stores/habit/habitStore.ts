import { defineStore } from 'pinia'
import { PiniaGenerics, State, Record } from '../PiniaGenerics'
import { HasUser, useUsersStore } from '../user/userStore'

import {
  CompletionEntry,
  habitStatus,
  sampleType,
  useCompletionsStore,
} from '../completion/completionStore'
import Utils from 'src/util'
import { useDailyLogsStore } from '../dailyLog/dailyLogStore'
import { useAxiosStore } from '../axios-store'

export class Habit extends Record implements HasUser {
  userID?: number = undefined
  title = 'Untitled'
  createdAt = ''

  static defaults() {
    const newHabit: Habit = {
      userID: useUsersStore().getUser().id,
      title: 'New Habit',
      createdAt: '',
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
        return latestCompletion.status === habitStatus.COMPLETED
      },
    times_sampled:
      () =>
      (id?: number): number => {
        if (typeof id === 'undefined') throw new Error('id was undefined')
        const entries = useCompletionsStore().allItemsForHabit(id)
        return entries.filter((x) => x.status !== habitStatus.UNSPECIFIED)
          .length
      },
    times_completed:
      () =>
      (id?: number): number => {
        if (typeof id === 'undefined') throw new Error('id was undefined')
        const completionStore = useCompletionsStore()
        const entries: CompletionEntry[] = completionStore.allItemsForHabit(id)
        return entries.filter((x) => x.status === habitStatus.COMPLETED).length
      },
    latestDailyLog: () => (habitID: number) => {
      const completionStore = useCompletionsStore()
      const completion = completionStore.latestCompletionEntryForHabit(habitID)
      return Utils.hardCheck(
        useDailyLogsStore().getByID(completion.dailyLogID),
        'could not find daily log from latest completion entry of provided habit id'
      )
    },
    allHabitsOnOrBeforeDate: (state) => (dateStr: string) => {
      const habitsOnOrAfter = state.items.filter((x) => {
        return Utils.OnOrBefore(dateStr, x.createdAt)
      })
      return habitsOnOrAfter
    },
  },
  actions: {
    times_completed_internal(id?: number) {
      // subtract latest log's status in order to prevent re-sampling
      const completionStore = useCompletionsStore()
      const latest = completionStore.latestCompletionEntryForHabit(id)
      const latestStatusFlag =
        latest.status === habitStatus.COMPLETED
          ? habitStatus.NOTCOMPLETED
          : habitStatus.UNSPECIFIED
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
      const successes = entries.filter(
        (x) => x.status === habitStatus.COMPLETED
      ).length
      const sampled = entries.filter(
        (x) => x.status !== habitStatus.UNSPECIFIED
      ).length
      return successes / sampled
    },
    roses() {
      const cs = useCompletionsStore()
      if(typeof this.items === 'undefined' || this.items === null) return []
      console.log({ items: this.items })
      return this.items.filter(
        (x) =>
          cs.latestCompletionEntryForHabit(x.id).sampleType ===
          sampleType.TOPPERFORMER
      )
    },

    thorns() {
      const cs = useCompletionsStore()
      if(typeof this.items === 'undefined' || this.items === null) return []
      return this.items.filter(
        (x) =>
          cs.latestCompletionEntryForHabit(x.id).sampleType ===
          sampleType.NEEDSWORK
      )
    },
    // todo: make these generic
    // problem is 'this' is possibly undefined
    async createItem(item: Habit) {
      this.loading = true
      await useAxiosStore().axios()
        .post('/habits', item, {
          headers: {},
          params: {},
        })
        .then(async (response) => {
          console.log('createItem response from backend: ', response)
          const newObj: Habit = response.data
          this.items.push(newObj)
          const cs = useCompletionsStore()
          const dls = useDailyLogsStore()
          const latestLog = Utils.hardCheck(dls.latestLog())
          console.log('creating completion entry on latest log ', latestLog)
          const newEntry: CompletionEntry = {
            habitID: newObj.id,
            dailyLogID: latestLog.id,
            status: habitStatus.UNSPECIFIED,
            sampleType: sampleType.NOTSAMPLED,
            completionRateOnDate: 0
          }
          await cs.createItem(newEntry)
          this.loading = false
        }, Utils.handleError('Error creating item.'))
    },
    async fetchAll(): Promise<Habit[]> {
      this.loading = true
      const response = await useAxiosStore().axios().get('/habits', {
        headers: {},
        params: {},
      })
      if(typeof response.data === 'undefined' || response.data === null || response.data === '') this.items = []
      else this.items = response.data
      this.loading = false
      return this.items
    },
    async fetchItem(id: number) {
      this.loading = true
      const response = await useAxiosStore().axios().get(`/habits/${id}`, {
        headers: {},
        params: {},
      })
      this.loading = false
      return response.data
    },
    async updateItem(item: Habit) {
      this.loading = true
      const index = this.items.findIndex((x) => x.id === item.id)
      if (index !== -1) {
        await useAxiosStore().axios()
          .patch(`/habits/${item.id}`, item, {
            headers: {},
          })
          .then((response) => {
            this.items[index] = { ...this.items[index], ...item }
            this.loading = false
            return response
          }, Utils.handleError('Error updating item.'))
      }
    },
    async deleteItem(id: number) {
      this.loading = true
      const index = this.items.findIndex((x) => x.id === id)
      if (index !== -1) {
        await useAxiosStore().axios()
          .delete(`/habits/${id}`, {
            headers: {},
          })
          .then((response) => {
            this.items.splice(index, 1)
            this.loading = false
            return response
          }, Utils.handleError('Error deleting item.'))
      }
    },
  },
})
