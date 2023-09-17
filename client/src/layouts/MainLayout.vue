<template>
  <q-layout view="lHh Lpr lFf">
    <q-header elevated>
      <q-toolbar>
        <q-btn
          flat
          dense
          round
          icon="menu"
          aria-label="Menu"
          @click="toggleLeftDrawer"
        />

        <q-toolbar-title> Quasar App </q-toolbar-title>

        <existential-dread></existential-dread>
      </q-toolbar>
    </q-header>

    <q-drawer v-model="leftDrawerOpen" show-if-above bordered>
      <existential-dread></existential-dread>
      <q-list>

        <EssentialLink
          v-for="link in essentialLinks"
          :key="link.title"
          v-bind="link"
        />
      </q-list>
    </q-drawer>

    <q-page-container>
      <router-view />
    </q-page-container>
  </q-layout>
</template>

<script lang="ts">
import { defineComponent, ref } from 'vue'
import EssentialLink from 'components/EssentialLink.vue'
import ExistentialDread from 'components/ExistentialDread.vue'
import { mapRepos, useRepo } from 'pinia-orm'
import DailyLog from 'src/stores/daily-log/daily-log'
import TheGreatHydrator from 'src/stores/TheGreatHydrator'
import NotAnORM from 'src/stores/NotAnORM'
import { Habit } from 'src/stores/habit/habit'

const linksList = [
  {
    title: 'Dashboard',
    icon: 'space_dashboard',
    link: '/dashboard',
  },
  {
    title: 'Daily Logs',
    icon: 'view_agenda',
    link: '/logs',
  },
  {
    title: 'Food Logs',
    icon: 'tapas',
    link: '/food-logs',
  },
  {
    title: 'Weight Logs',
    icon: 'monitor_weight',
    link: '/weight-logs',
  },
  {
    title: 'All Habits',
    icon: 'checklist',
    link: '/habits',
  },
  {
    title: 'Settings',
    icon: 'manage_accounts',
    link: 'settings',
  },
  {
    title: 'All Daily Logs',
    icon: 'checklist',
    link: 'daily-logs'
  },
  {
    title: 'Completion Entries',
    icon: 'checklist',
    link: 'completions'
  },
  {
    title: 'Super User',
    icon: 'edit',
    link: 'super'
  }
]

export default defineComponent({
  name: 'MainLayout',

  components: {
    EssentialLink,
    ExistentialDread
  },

  async setup() {
    const leftDrawerOpen = ref(false)

    await useRepo(DailyLog).piniaStore().axios_getAll()
    
    const checkTime = async () => {let currentTime = new Date()
      const repo = useRepo(DailyLog)
      let latestLog = repo.orderBy('logDate', 'desc').limit(1).get()[0]
      let latestLogTime = new Date(latestLog.logDate)
      //console.log('latestlogtime: ', latestLogTime, ' is type of: ', typeof latestLogTime)
      while(currentTime.getDate() !== latestLogTime.getDate()) {
        console.log("conditions were met, we're adding a log")
        let response = await repo.piniaStore().axios_createItem({
          previousLogID: latestLog.id!,
          userID: latestLog.userID,
          logDate: new Date(latestLogTime.getTime() + 86400000)
        })
        latestLog = NotAnORM.getRelated<DailyLog>(repo, response.data.id)
        latestLogTime.setTime(latestLogTime.getTime() + 86400000)
        console.log(currentTime.getDate(), " vs ", latestLogTime.getDate())
        //todo: I hate this
      }
      await repo.piniaStore().axios_getAll()
      await useRepo(Habit).piniaStore().axios_getAll()
      setTimeout(checkTime, 10000)
    }

    await checkTime()

    return {
      essentialLinks: linksList,
      leftDrawerOpen,
      toggleLeftDrawer() {
        leftDrawerOpen.value = !leftDrawerOpen.value
      },
    }
  },

  computed: {
    ...mapRepos({
      dailyLogRepo: DailyLog
    })
  }
})
</script>
