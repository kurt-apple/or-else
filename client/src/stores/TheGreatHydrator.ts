import { Model, Repository, useRepo } from 'pinia-orm';
import DailyLog from './daily-log/daily-log';
import { User } from './user/user';
import CompletionEntry from './completion/completion';
import { Habit } from './habit/habit';

export default class TheGreatHydrator {
  static async hydratify(repos: Repository[]) {
    for(let i = 0; i < repos.length; i++) {
      await repos[i].piniaStore().axios_getAll()
    }
  }
  static async brrrrr() {
    const repos = [useRepo(DailyLog), useRepo(User), useRepo(CompletionEntry), useRepo(Habit)]
    await this.hydratify(repos)
  }
}