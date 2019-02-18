import { Color } from './color';

export class Relation {

  public fromIndex = -1;
  public fromList: any;
  public modifier: any;

  constructor(modifier: any = null, index = -1, list = null) {
    this.fromIndex = index;
    this.fromList = list;
    this.modifier = modifier;

  }

  get result() {
    if (this.modifier instanceof Color) {
      if (this.fromIndex === -1) {
        return this.modifier;
      }
      if (this.fromList[this.fromIndex] !== undefined) {
        return this.fromList[this.fromIndex].result.add(this.modifier);
      }
      throw new Error('Relation cant find a color in index: ' + this.fromIndex);
    }

    return this.modifier(null, this.fromIndex, this.fromList);
  }

}
