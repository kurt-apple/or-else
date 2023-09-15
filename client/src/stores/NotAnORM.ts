import { Model, Repository, useRepo } from 'pinia-orm';

export default class NotAnORM {
  static getRelated(repo: Repository, id: number) {
    return repo.where((item) => {
      return item.id == id
    }).get()[0]
  }
}