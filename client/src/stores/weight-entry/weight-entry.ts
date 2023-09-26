// import { Model } from 'pinia-orm';
// import { Num, Attr } from 'pinia-orm/dist/decorators';
// import AxiosPiniaCRUD from '../AxiosPiniaCRUD';

// class WeightEntry extends Model {
//   static entity = 'weight-entries'
//   @Attr(null) declare id: number | null
//   @Attr(null) declare dailyLogId: number
//   @Attr('') declare dateTime: string
//   @Num(0) declare weight: number
//   static piniaOptions = {
//     actions: {
//       ...AxiosPiniaCRUD.generateActions<WeightEntry>(this.entity)
//     }
//   };
// }