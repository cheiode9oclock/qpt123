import { Color } from '../color';

export class LAB extends Color {

  static readonly MODEL: string = 'lab';
  static readonly ALPHA_INDEX = 3;
  static readonly RANGES = [[0, 100], [-128, 128], [-128, 128], [0, 1]];


  constructor(value?: any, clampValues = true) {
    super(value, LAB.RANGES, LAB.MODEL, LAB.ALPHA_INDEX, clampValues);
  }

}
