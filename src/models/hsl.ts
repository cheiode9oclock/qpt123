import { Base } from '../base';
import { Color } from '../color';

export class HSL extends Color {
  public static readonly MODEL: string = 'hsl';
  public static readonly ALPHA_INDEX = 3;
  public static readonly RANGES = [[0, 360], [0, 100], [0, 100], [0, 1]];

  constructor(value?: any, clampValues = true) {
    super(value, HSL.MODEL, clampValues);
  }
}
