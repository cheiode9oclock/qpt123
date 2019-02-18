import { Color } from '../color';

export class CMYK extends Color {

  static readonly MODEL: string = 'cmyk';
  static readonly ALPHA_INDEX = 4;
  static readonly RANGES = [[0, 100], [0, 100], [0, 100], [0, 100], [0, 1]];


  constructor(value: number[] = [0, 0, 0, 0], clampValues = true) {
    super(value, CMYK.RANGES, CMYK.MODEL, CMYK.ALPHA_INDEX, clampValues);
  }

}
