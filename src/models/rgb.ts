import { Color } from '../color';

export class RGB extends Color {

  public static readonly MODEL: string = 'rgb';
  public static readonly ALPHA_INDEX = 3;
  public static readonly RANGES = [[0, 255], [0, 255], [0, 255], [0, 1]];


  constructor(value: number[] = [0, 0, 0, 1], clampValues = true) {
    super(value, RGB.RANGES, RGB.MODEL, RGB.ALPHA_INDEX, clampValues);
  }

}
