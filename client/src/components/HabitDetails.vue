<template>
  <q-dialog ref="dialogRef" @hide="onDialogHide">
    <q-card class="q-dialog-plugin">
      <q-card-section>
        <div class="text-h6">Habit Details</div>
      </q-card-section>
      <q-card-section>
        <q-item-label>TITLE</q-item-label>
        <q-input
          v-model="habitData.title"
          @update:model-value="markUnsaved"
        ></q-input>
      </q-card-section>

      <q-card-section v-if="message" class="q-pt-none">
        {{ message }}</q-card-section
      >

      <q-card-actions align="right">
        <q-btn flat label="OK" color="primary" @click="onOKClick" />
        <q-btn
          v-if="unsavedChanges"
          flat
          label="SAVE"
          color="primary"
          @click="onSaveClick"
        />
      </q-card-actions>
    </q-card>
  </q-dialog>
</template>

<script setup lang="ts">
import { useDialogPluginComponent } from 'quasar'
import { Habit, useHabitsStore } from 'src/stores/habit/habitStore'
import { computed, ref } from 'vue'

const props = withDefaults(
  defineProps<{ habit: Habit | null; mode: 'create' | 'update' }>(),
  {
    habit: null,
    mode: 'create',
  }
)

const emit = defineEmits([
  // REQUIRED; need to specify some events that your
  // component will emit through useDialogPluginComponent()
  ...useDialogPluginComponent.emits,
])

const { dialogRef, onDialogOK, onDialogHide } = useDialogPluginComponent()

const habitsStore = useHabitsStore()

const habitData =
  props.habit === null || typeof props.habit === 'undefined'
    ? ref<Habit>(Habit.defaults())
    : ref<Habit>({
        id: props.habit.id,
        userID: props.habit.userID,
        title: props.habit.title,
      })

console.log('funny business', {
  habitData: habitData.value,
  'habit prop': props.habit,
})

const unsavedChanges = ref(false)

const markUnsaved = () => {
  unsavedChanges.value = true
}

const onOKClick = () => {
  console.log('ok')
  onDialogOK()
}

const onSaveClick = async () => {
  console.log('ree')
  console.log('habit prop: ', props.habit ? 'update' : 'create')
  onDialogOK({
    item: habitData.value,
    unsaved: unsavedChanges.value,
  })
}

const message = computed(() => {
  if (
    typeof habitData.value.id === 'undefined' ||
    habitData.value.id === null
  ) {
    return null
  } else {
    return (
      'Habit completion rate is ' +
      habitsStore.completionRate(habitData.value.id)
    )
  }
})
</script>
