<script setup lang="ts">
import { useDialogPluginComponent } from 'quasar'
import { FoodEntry } from 'src/stores/foodEntry/foodEntryStore'
import { ref } from 'vue'

const props = withDefaults(
  defineProps<{ foodEntry?: FoodEntry; mode: 'create' | 'update' }>(),
  {
    foodEntry: undefined,
    mode: 'create',
  }
)

const { dialogRef, onDialogOK, onDialogHide } = useDialogPluginComponent()

const foodEntryData =
  props.foodEntry === null || typeof props.foodEntry === 'undefined'
    ? ref<FoodEntry>({
        id: 0,
        dailyLogID: 0,
        foodItemID: 0,
        qty: 0,
      })
    : ref<FoodEntry>({
        id: props.foodEntry.id,
        dailyLogID: props.foodEntry.dailyLogID,
        foodItemID: props.foodEntry.foodItemID,
        qty: props.foodEntry.qty,
      })

const unsavedChanges = ref(false)

const markUnsaved = () => {
  console.log('ok')
  onDialogOK()
}

const onSaveClick = async () => {
  console.log(
    'foodEntryDetails onSaveClick - ',
    props.foodEntry ? 'update' : 'create'
  )
  onDialogOK({
    item: foodEntryData.value,
    unsaved: unsavedChanges.value,
  })
}
</script>

<template>
  <q-dialog ref="dialogRef" @hide="onDialogHide">
    <q-card class="q-dialog-plugin">
      <q-card-section>
        <div class="text-h6">Food Entry Details</div>
      </q-card-section>
      <q-card-section>
        <q-item-label>DATE</q-item-label>
      </q-card-section>
    </q-card>
  </q-dialog>
</template>
