import { useDailyLogsStore } from './dailyLog/dailyLogStore'
import { useUsersStore } from './user/userStore'
import { useCompletionsStore } from './completion/completionStore'
import { useHabitsStore } from './habit/habitStore'
import { Store } from 'pinia'
import { useFoodEntryStore } from './foodEntry/foodEntryStore'
import { useFoodItemStore } from './foodItem/foodItemStore'
import { useWeightEntryStore } from './weight-entry/weightEntryStore'

export default class TheGreatHydrator {
  static async hydratify(repos: Store[]) {
    // todo: need to shape the stores into customstore to guarantee it will have certain actions
    // ... or don't. that would be more fun.
    for (let i = 0; i < repos.length; i++) {
      // await repos[i].fetchAll()
    }
  }

  static async brrrrr() {
    console.log('FETCHING ALL RECORDS FROM DB')
    // const repos = [
    //   useDailyLogsStore(),
    //   useUsersStore(),
    //   useCompletionsStore(),
    //   useHabitsStore(),
    // ]
    // await this.hydratify(repos)
    await useDailyLogsStore().fetchAll()
    await useUsersStore().fetchAll()
    await useCompletionsStore().fetchAll()
    await useHabitsStore().fetchAll()
    console.log('all habits from hydrator: ', useHabitsStore().getAll())
    await useFoodEntryStore().fetchAll()
    await useFoodItemStore().fetchAll()
    await useWeightEntryStore().fetchAll()
    const log = useDailyLogsStore().allAsc()[0]
    await useDailyLogsStore().reSample(log)
  }
}
