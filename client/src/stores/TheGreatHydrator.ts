import { Model, Repository, useRepo } from 'pinia-orm';

export default class TheGreatHydrator {
  static async hydratify(repos: Repository[]) {
    for(let i = 0; i < repos.length; i++) {
      await repos[i].piniaStore().axios_getAll()
    }
  }
}