import { Color } from '../color';

export class XYZ extends Color {

  static readonly MODEL: string = 'lab';
  static readonly ALPHA_INDEX = 3;
  static readonly RANGES = [[0, 100], [0, 100], [0, 100], [0, 1]];


  constructor(value?: any, clampValues = true) {
    super(value, XYZ.RANGES, XYZ.MODEL, XYZ.ALPHA_INDEX, clampValues);
  }

}
