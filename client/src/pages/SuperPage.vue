<template>
  <q-page padding>
    <user-list-card title="All Users" :users="users"></user-list-card>
  </q-page>
</template>

<script lang="ts">
import { mapRepos, useRepo } from 'pinia-orm';
import { defineComponent } from 'vue'
import UserListCard from 'src/components/UserListCard.vue';
import { User } from 'src/stores/user/user';
export default defineComponent({
  name: 'SuperPage',
  components: {
    UserListCard
  },
  setup() {
    const repo = useRepo(User)
    try {
      repo.piniaStore()
    } catch (error: any) {
      console.error('error accessing pinia store.', error)
    }
    if (repo.piniaStore() == null || typeof repo === 'undefined') {
      throw new Error('Pinia store is not found')
    }
    const userStore = repo.piniaStore()
    userStore.axios_getAll()
  },
  computed: {
    ...mapRepos({
      userRepo: User
    }),
    users(): User[] {
      return this.userRepo.all()
    }
  }
})
</script>
