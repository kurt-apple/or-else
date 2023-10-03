<template>
  <q-page padding>
    <div>
      <habit-card title="All Habits" :habits="habits"></habit-card>
    </div>
    <q-page-sticky position="bottom-right" :offset="[18, 18]">
      <q-btn fab icon="add" color="accent" @click="addHabitDialog" />
    </q-page-sticky>
  </q-page>
</template>

<script lang="ts">
import { useQuasar } from 'quasar'
import HabitCard from 'src/components/HabitCard.vue'
import HabitDetails from 'src/components/HabitDetails.vue'
import { useHabitsStore } from 'src/stores/habit/habitStore'
import { ref } from 'vue'

export default {
  components: { HabitCard },
  setup() {
    const habits = ref(useHabitsStore().items)
    const $q = useQuasar()
    const addHabitDialog = () => {
      console.log('add habit dialog')
      $q.dialog({
        component: HabitDetails,
        componentProps: {
          habit: null,
        },
      })
        .onOk(() => {
          console.log('OK')
          // console.log('habits:', useHabitsStore().getAll())
        })
        .onCancel(() => {
          console.log('Cancel')
        })
        .onDismiss(() => {
          console.log('Dismissed Dialog')
        })
    }
    return {
      habits,
      addHabitDialog,
    }
  },
}
</script>
