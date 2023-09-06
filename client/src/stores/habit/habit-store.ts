import { defineStore } from 'pinia'
import { useRepo } from 'pinia-orm'
import { Habit, HabitsState, ICreateHabitOptions } from 'stores/habit/habit'
import { PiniaCRUD } from '../genericPiniaCRUD'
//import { PiniaCRUD } from 'stores/genericPiniaCRUD'

export const useHabitsStore = defineStore(Habit.entity, {
	state: (): HabitsState => {
		return {
			habits: []
		}
	},
	actions: {
		...PiniaCRUD.generateStoreActions<Habit, ICreateHabitOptions>(Habit.entity, useRepo(Habit)),
		...PiniaCRUD.generateFetchAll<Habit>(Habit.entity, useRepo(Habit))
	}
})
