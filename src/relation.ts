import { Color } from './color';

export class Relation {
  public from: Relation | undefined;
  public fromList: any;
  public modifier: any;
  public readonly id: string;

  constructor(modifier: any = null, from?: Relation, list = null) {
    this.from = from;
    this.fromList = list;
    this.modifier = modifier;
    this.id = this.newID();
  }

  private newID() {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
      // tslint:disable-next-line:no-bitwise
      const r = (Math.random() * 16) | 0;
      // tslint:disable-next-line:no-bitwise
      const v = c === 'x' ? r : (r & 0x3) | 0x8;
      return v.toString(16);
    });
  }


  get result(): Color {
    if (this.modifier instanceof Color) {
      if (this.from === undefined) {
        return this.modifier;
      }
      // return composition of colors using the "add" method
      return this.from.result.add(this.modifier, false);
    }
    return this.modifier(null, this.from, this.fromList);
  }
}
