<template>
  <q-page padding>
    <br/>
    <q-slider v-model="user.completionRateThreshold" name="Completion Rate Threshold" :snap="true" :step="0.01" :label-always="true" :markers="true" :min="0.5" :max="1.0" />
    <q-slider v-model="user.startingRation" name="Starting Ration" :snap="true" :step="50" :label-always="true" :markers="true" :min="1400" :max="3000" />
    <q-btn @click="saveUserSettings" icon="save">Save</q-btn>
  </q-page>
</template>

<script lang="ts">
import { mapRepos, useRepo } from 'pinia-orm';
import { User } from 'src/stores/user/user';
import { defineComponent, ref } from 'vue'
export default defineComponent({
  name: 'AccountSettings',
  async setup() {
    const tmpUserRepo = useRepo(User)
    console.log("tmpuserrepo: ", tmpUserRepo)
    await tmpUserRepo.piniaStore().axios_getAll()
    let users = tmpUserRepo.where('name', 'DEFAULT').get()
    console.log("users: ", users)
    let defaultUser = tmpUserRepo.where('name', 'DEFAULT').first()
    console.log("default user: ", defaultUser)
    if(defaultUser == null) {
      throw new Error("default user is null")
    }
    return {
      user: ref(defaultUser)
    }
  },
  computed: {
    ...mapRepos ({
      userRepo: User
    })
  },
  methods: {
    async saveUserSettings () {
      let result = await this.userRepo.piniaStore().axios_updateItem(this.user)
      console.log(result)
    }
  }
})
</script>