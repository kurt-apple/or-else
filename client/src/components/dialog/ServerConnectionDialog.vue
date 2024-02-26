<script setup lang="ts">
import { useDialogPluginComponent } from 'quasar'
import TheGreatHydrator from 'src/stores/TheGreatHydrator'
import { useAxiosStore } from 'src/stores/axios-store'
import { ref } from 'vue'

const connectionString = ref()
connectionString.value = useAxiosStore().url ?? 'localhost:999'

const refreshAll = async () => {
  useAxiosStore().url = connectionString.value
  await TheGreatHydrator.brrrrr()
}

const emit = defineEmits([
  ...useDialogPluginComponent.emits
])

const { dialogRef, onDialogHide, onDialogCancel } = useDialogPluginComponent()

</script>

<template>
  <q-dialog ref="dialogRef" @hide="onDialogHide">
    <q-card class="q-dialog-plugin">
      <q-card-section>
        <div class="text-h6">Server Connection Details</div>
        <q-btn class="q-ma-sm" size="md" color="grey" label="Close" @click="onDialogCancel" />
      </q-card-section>
      <q-card-section>
        <q-input
          v-model="connectionString"
          filled
          label="URL (including port number)"
          placeholder="localhost:999"
          clearable
          class="q-my-md"
          @keyup.enter="refreshAll"
        />
      </q-card-section>
    </q-card>
  </q-dialog>
</template>