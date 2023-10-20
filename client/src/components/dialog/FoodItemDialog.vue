<script setup lang="ts">
import { useDialogPluginComponent } from 'quasar'
import { FoodItem, useFoodItemStore } from 'src/stores/foodItem/foodItemStore'
import { computed, ref } from 'vue'

const props = withDefaults(
  defineProps<{ foodItem?: FoodItem; mode: 'create' | 'update' }>(),
  {
    foodItem: undefined,
    mode: 'create',
  }
)

const emit = defineEmits([...useDialogPluginComponent.emits])

const { dialogRef, onDialogOK, onDialogHide } = useDialogPluginComponent()

const foodItemStore = useFoodItemStore()

const foodData =
  props.foodItem === null || typeof props.foodItem === 'undefined'
    ? ref<FoodItem>(FoodItem.defaults())
    : ref<FoodItem>({
        id: props.foodItem.id,
        name: props.foodItem.name,
        unit: props.foodItem.unit,
        caloriesPerUnit: props.foodItem.caloriesPerUnit,
      })

const unsavedChanges = ref(false)

const hasValue = (x: string | number) => {
  return x !== null && typeof x !== 'undefined' && x !== ''
}

const markUnsaved = () => {
  if (
    hasValue(foodData.value.name) &&
    hasValue(foodData.value.unit) &&
    hasValue(foodData.value.caloriesPerUnit)
  )
    unsavedChanges.value = true
}

const onOKClick = onDialogOK

const onSaveClick = async () => {
  onDialogOK({
    item: foodData.value,
    unsaved: unsavedChanges.value,
  })
}
</script>

<template>
  <q-dialog ref="dialogRef" @hide="onDialogHide">
    <q-card class="q-dialog-plugin">
      <q-card-section>
        <div class="text-h6">Food Item Details</div>
      </q-card-section>
      <q-card-section>
        <q-item-label>NAME</q-item-label>
        <q-input
          v-model="foodData.name"
          @update:model-value="markUnsaved"
        ></q-input>
      </q-card-section>
      <q-card-section>
        <q-item-label>UNIT</q-item-label>
        <q-input
          v-model="foodData.unit"
          @update:model-value="markUnsaved"
        ></q-input>
      </q-card-section>
      <q-card-section>
        <q-item-label>CALORIES PER UNIT</q-item-label>
        <q-input
          v-model.number="foodData.caloriesPerUnit"
          type="number"
          @update:model-value="markUnsaved"
        ></q-input>
      </q-card-section>
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
