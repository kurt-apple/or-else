<template>
  <h1>{{ title }}</h1>
  <q-btn :icon="editModeToggle ? 'visibility' : 'edit'" @click="toggleEditMode"></q-btn>
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
        {{  u.id }}
      </q-item-section>
      <q-item-section>
        <q-item-label> edit mode: {{ u.name }}</q-item-label>
      </q-item-section>
      <q-item-section>
        <q-item-label> {{ u.id }}</q-item-label>
      </q-item-section>
      <q-item-section>
        <q-btn icon="delete" @click="deleteUser(u)" color="negative"/>
      </q-item-section>
    </q-item>
  </q-list>
</template>

<script lang="ts">
import { mapRepos } from 'pinia-orm';
import { User } from 'src/stores/user/user'
import { PropType, defineComponent, ref } from 'vue';
export default defineComponent({
  name: 'UserListCard',
  props: {
    title: {
      type: String,
      default: 'Users'
    },
    users: {
      type: Array as PropType<User[]>,
      default: () => []
    }
  },
  setup() {
    return {
      editModeToggle: ref(false)
    }
  },
  computed: {
    ...mapRepos ({
      userRepo: User
    }),
  },
  methods: {
    async deleteUser(user: User) {
      console.log("delete item id: ", user.id)
      let result;
      if(user.id != null) {
        result = await this.userRepo.piniaStore().axios_deleteItem(user.id)
      }
      console.log("result: ", result)
      this.userRepo.piniaStore().axios_getAll()
    },
    toggleEditMode() {
      this.editModeToggle = !this.editModeToggle
      console.log("edit mode is now ", this.editModeToggle ? "enabled" : "disabled")
    }
  }
})
</script>