import { Color } from '../color';

export class CMYK extends Color {
  public static readonly MODEL: string = 'cmyk';
  public static readonly ALPHA_INDEX = 4;
  public static readonly RANGES = [[0, 100], [0, 100], [0, 100], [0, 100], [0, 1]];

  constructor(value?: any, clampValues = true) {
    super(value, CMYK.MODEL, clampValues);
  }
}
