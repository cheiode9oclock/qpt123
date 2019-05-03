import { Color } from '../color';

export class XYZ extends Color {
  public static readonly MODEL: string = 'xyz';
  public static readonly ALPHA_INDEX = 3;
  public static readonly RANGES = [[0, 100], [0, 100], [0, 100], [0, 1]];

  constructor(value?: any, clampValues = true) {
    super(value, XYZ.MODEL, clampValues);
  }
}
