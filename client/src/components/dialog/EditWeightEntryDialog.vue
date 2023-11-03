<template>
  <q-dialog ref="dialogRef" @hide="onDialogHide">
    <q-card class="q-dialog-plugin">
      <q-card-section>
        <div class="text-h6">Weight Entry Details</div>
      </q-card-section>
      <q-card-section>
        <q-item-label>DATE & TIME</q-item-label>
        <q-input v-model="weightEntryData.time" @update:model-value="timeUpdated" />
      </q-card-section>
      <q-card-section>
        <q-item-label>WEIGHT</q-item-label>
        <q-input v-model="weightEntryData.weight" @update:model-value="markUnsaved" />
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

<script setup lang="ts">
import { useDialogPluginComponent } from 'quasar'
import { useDailyLogsStore } from 'src/stores/dailyLog/dailyLogStore'
import { WeightEntry } from 'src/stores/weight-entry/weightEntryStore'
import Utils from 'src/util'
import { ref } from 'vue'

const props = defineProps<{entry: WeightEntry}>()

const weightEntryData = ref(Utils.hardCheck(props.entry, 'Weight entry is null or undefined'))
const unsavedChanges = ref(false)
const newDailyLogID = ref(weightEntryData.value.dailyLogID)

const emit = defineEmits([...useDialogPluginComponent.emits])
const { dialogRef, onDialogOK, onDialogHide } = useDialogPluginComponent()
const onOKClick = onDialogOK
const onSaveClick = async () => {
  onDialogOK({
    item: weightEntryData.value,
    unsaved: unsavedChanges.value,
  })
}

const dls = useDailyLogsStore()

const timeUpdated = () => {
  const qdl = dls.queryDate(weightEntryData.value.time)
  newDailyLogID.value = qdl ? qdl.id : newDailyLogID.value
  markUnsaved()
}
const markUnsaved = () => { unsavedChanges.value = true }

</script>