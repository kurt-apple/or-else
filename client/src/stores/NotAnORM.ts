import { Model, Repository, useRepo } from 'pinia-orm';

export default class NotAnORM {
  static getRelatedAll<M extends Model>(repo: Repository<M>, id: number) {
    return repo.where((item) => {
      return item.id == id
    }).withAll().get()[0]
  }
  static getManyRelatedAll<M extends Model>(repo: Repository<M>, key: string, id: number) {
    return repo.where((item) => {
      return item.key == id
    }).withAll().get()
  }
}