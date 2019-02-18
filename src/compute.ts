import { Base } from './base';
import { BaseFactory } from './base-factory';
import { Color } from './color';

export class Compute {


  /**
   * Clamp and return value rounded to precision
   */
  public static clamp(values: number[], ranges: any): number[] {

    return values.map((o, i, l) => {

      const val = l[i];

      const result = ranges[i][0] > val ? ranges[i][0] : ranges[i][1] < val ? ranges[i][1] : val;
      return l[i] = result;

    });
  }

  public static lighten(color: Color, amount: number = 0.25) {

    const hsl = color.to('hsl');
    hsl.channels[2] += hsl.ranges[2][1] * amount;
    return hsl.to(color.model);

  }

  public static darken(color: Color, amount: number = 0.25) {

    const hsl = color.to('hsl');

    hsl.channels[2] -= hsl.channels[2] * amount;

    return hsl.to(color.model);

  }

  public static invert(color: Color) {

    const rgb = color.to('rgb');
    for (let i = 0; i < 3; i++) {
      rgb.channels[i] = 255 - rgb.channels[i];
    }
    return rgb.to(color.model);

  }

  public static saturate(color: Color, amount: number = 0.25) {

    const hsl = color.to('hsl');
    if (hsl.channels[1] > 0) {
      hsl.channels[1] += hsl.channels[1] * amount;
    } else {
      hsl.channels[1] = amount;
    }
    return hsl.to(color.model);
  }

  public static desaturate(color: Color, amount: number = 0.25) {

    const hsl = color.to('hsl');
    hsl.channels[1] -= hsl.channels[1] * amount;
    return hsl.to(color.model);
  }

  public static grayscale(color: Color, amount = 1) {
    const rgb = color.to('rgb');
    const gray = rgb.channels[0] * 0.21 * amount + rgb.channels[1] * 0.72 * amount + rgb.channels[2] * 0.07 * amount;

    return rgb.to(color.model);
  }

  public static rotate(color: Color, amount: number = 180) {
    const hsl = color.to('hsl');
    let hue = hsl.channels[0];
    hue = ((hue + amount) % 360 + 360) % 360;
    hsl.channels[0] = hue;
    return hsl.to(color.model);
  }

  public static luma(color: Color): number {
    const rgb = color.to('rgb');
    return (0.3 * rgb.channels[0] + 0.59 * rgb.channels[1] + 0.11 * rgb.channels[0]) / 255;
  }


}
