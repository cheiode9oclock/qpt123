import { Color } from '../color';

export class HSL extends Color {


  constructor(value = [0, 0, 0, 1], clampValues = true) {
    super(value, HSL.RANGES, HSL.MODEL, HSL.ALPHA_INDEX, false);
    if (clampValues) {
      this.clamp(this.channels, HSL.RANGES);
    }
  }

  static readonly MODEL: string = 'hsl';
  static readonly ALPHA_INDEX = 3;
  static readonly RANGES = [[0, 360], [0, 100], [0, 100], [0, 1]];


  clamp(values?: number[], ranges?: any): number[] {

    if (values === undefined) {
      values = this.channels;
    }

    if (ranges === undefined) {
      ranges = HSL.RANGES;
    }

    values[0] = values[0] % 360;
    for (let i = 1; i < values.length; i++) {
      values[i] = ranges[i][0] > values[i] ? ranges[i][0] : ranges[i][1] < values[i] ? ranges[i][1] : values[i];
    }
    return values;
  }

}
