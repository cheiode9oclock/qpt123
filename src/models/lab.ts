import { Color } from '../color';

export class LAB extends Color {
  public static readonly MODEL: string = 'lab';
  public static readonly ALPHA_INDEX = 3;
  public static readonly RANGES = [[0, 100], [-128, 128], [-128, 128], [0, 1]];

  constructor(value?: any, clampValues = true) {
    super(value, LAB.MODEL, clampValues);
  }
}
