// import { Attr, Str, BelongsTo, HasMany, OnDelete } from 'pinia-orm/dist/decorators'
// import { Model, useRepo } from 'pinia-orm'
// import AxiosPiniaCRUD from '../AxiosPiniaCRUD'
// import { User } from '../user/user'
// import CompletionEntry from '../completion/completion'
// import NotAnORM from '../NotAnORM'
// //import User from 'stores/user/user'

// class Habit extends Model {
//   static entity = 'habits'
//   //static primaryKey: string | string[] = 'id'
//   @Attr(null) declare id: number | null
//   @Attr(null) declare userID: number | null
//   @Str('') declare title: string
//   @BelongsTo(() => User, 'userID') declare user: User | null
//   @HasMany(() => CompletionEntry, 'habitID') @OnDelete('cascade') declare completionEntries: CompletionEntry[]
//   static piniaOptions = {
//     actions: {
//       ...AxiosPiniaCRUD.generateActions<Habit>(this.entity)
//     }
//   }
//   get times_sampled () {
//     if(this.completionEntries == null || typeof this.completionEntries === 'undefined') {
//       console.warn("completion Entries are not linked to the habit. Are you using the appropriate query?")
//       this.completionEntries = NotAnORM.getManyRelated<CompletionEntry>(useRepo(CompletionEntry), 'habitID', this.id!)
//     }
//     if(this.completionEntries == null || typeof this.completionEntries === 'undefined') {
//       throw new Error("I tried to set completionEntries it didn't work help")
//     }
//     const latest = this.latestCompletionEntry
//     if(latest == null || typeof latest === 'undefined') {
//       throw new Error(`tried to get latest completion entry for habit ${this.id} but it came back undefined or null`)
//     }
//     return this.completionEntries.filter((x) => {
//       x.status != 0
//     }).length - latest.status != 0 ? 1 : 0
//   }
//   get times_completed () {
//     if(this.completionEntries == null || typeof this.completionEntries === 'undefined') {
//       console.warn("completion Entries are not linked to the habit. Are you using the appropriate query?")
//       this.completionEntries = NotAnORM.getManyRelated<CompletionEntry>(useRepo(CompletionEntry), 'habitID', this.id!)
//     }
//     const latest = this.latestCompletionEntry
//     if(latest == null || typeof latest === 'undefined') {
//       throw new Error(`tried to get latest completion entry for habit ${this.id} but it came back undefined or null`)
//     }
//     return this.completionEntries.filter((x) => x.status == 2).length - latest.status == 2 ? 1 : 0
//   }
//   get completionRate () {
//     if(this.times_sampled == 0 || this.times_sampled == null) return 0.0
//     return this.times_completed / this.times_sampled

//     //todo: idea for score:
//     //times_completed * times_completed / times_sampled
//     // advantage is that long streaks are valued higher
//   }
//   priorCompletionRate(date: Date) {
//     if(new Date().getDate() == date.getDate()) return this.completionRate
//     const completions = useRepo(CompletionEntry).where((entry) => {
//       if(entry.habitID != this.id) return false
//       if(entry.dateValue.getDate() < date) return true
//       return false
//     }).get()
//     const successes = completions.filter((x) => x.status == 2).length
//     return successes / completions.length
//   }
//   getCompletionEntriesWithAll() {
//     this.completionEntries = NotAnORM.getManyRelated<CompletionEntry>(useRepo(CompletionEntry), 'habitID', this.id!)
//     return this.completionEntries
//   }
//   get latestCompletionEntry () {
//     if(typeof this.completionEntries === 'undefined' || this.completionEntries == null) {
//       console.warn("completion entries is not here, which might mean your query needs to include a .with clause")
//       return null
//     }
//     if(this.completionEntries.length == 0) {
//       return null
//     }
//     return this.completionEntries.sort((a, b) => {
//       if(b.dailyLog == null || a.dailyLog == null) {
//         console.warn("logs are coming in as null")
//         return 0
//       }
//       return b.dailyLog.dateValue.getTime() - a.dailyLog.dateValue.getTime()
//     })[0]
//   }
//   get wasCompletedToday() {
//     let latest = this.latestCompletionEntry
//     if(latest == null || typeof latest === 'undefined') {
//       console.warn('trying again with super getter')
//       this.getCompletionEntriesWithAll()
//       console.log("after super getter: ", this.latestCompletionEntry)
//     }
//     latest = this.latestCompletionEntry
//     if(latest == null || typeof latest === 'undefined') {
//       throw new Error('latestCompletionEntry returned null')
//     }
//     else return latest.status
//   }
//   set wasCompletedToday(value: 0 | 1 | 2) {
//     console.log("set wasCompletedToday to ", value)
//     const latest = this.latestCompletionEntry
//     if(latest == null || typeof latest === 'undefined') throw new Error('latestCompletionEntry returned null')
//     ///todo: generate new completion record and/or daily log if null
//     latest.status = value
//   }
// }
