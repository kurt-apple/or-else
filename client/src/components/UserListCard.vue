<script setup lang="ts">
import { useUsersStore, User } from 'src/stores/user/userStore'
import { ref } from 'vue'

const userStore = useUsersStore()

export interface Props {
  title?: string
  users?: Array<User>
}

const props = withDefaults(defineProps<Props>(), {
  title: 'Users',
  users: () => [],
})

const editModeToggle = ref(false)

const deleteUser = async (user: User) => {
  console.log('delete item id: ', user.id)
  let result
  if (user.id != null) {
    result = await userStore.deleteItem(user.id)
  }
  console.log('result: ', result)
}
const toggleEditMode = () => {
  editModeToggle.value = !editModeToggle.value
  console.log(
    'edit mode is now ',
    editModeToggle.value ? 'enabled' : 'disabled'
  )
}
</script>
<template>
  <h1>{{ title }}</h1>
  <q-btn
    :icon="editModeToggle ? 'visibility' : 'edit'"
    @click="toggleEditMode"
  ></q-btn>
  <q-list v-if="!editModeToggle">
    <q-item v-for="u in users" :key="u.name">
      <q-item-section>
        <q-item-label> {{ u.name }}</q-item-label>
      </q-item-section>
      <q-item-section>
        <q-item-label> {{ u.id }}</q-item-label>
      </q-item-section>
    </q-item>
  </q-list>
  <q-list v-else>
    <q-item v-for="u in users" :key="u.name">
      <q-item-section>
        {{ u.id }}
      </q-item-section>
      <q-item-section>
        <q-item-label> edit mode: {{ u.name }}</q-item-label>
      </q-item-section>
      <q-item-section>
        <q-item-label> {{ u.id }}</q-item-label>
      </q-item-section>
      <q-item-section>
        <q-btn icon="delete" color="negative" @click="deleteUser(u)" />
      </q-item-section>
    </q-item>
  </q-list>
</template>
