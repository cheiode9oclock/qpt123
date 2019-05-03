import { Base } from './base';
import { Color } from './color';

export class Compute {
  /**
   * Clamp and return value to stay inside range
   * @param value Value to be clamped
   * @param range Two numbers array, index 0 is the minimum , index 1 is the maximum
   */
  public static clampValue(value: number, range: number[]): number {
    return range[0] > value ? range[0] : range[1] < value ? range[1] : value;
  }

  public static clampRotation(value: number): number {
    if (value === Infinity || value === -Infinity) {
      return 0;
    }
    return ((value % 360) + 360) % 360;
  }

  public static isDark(value: Color): boolean {
    // YIQ equation from http://24ways.org/2010/calculating-color-contrast
    const copy = value.rgb();
    const yiq = (copy.channels[0] * 299 + copy.channels[1] * 587 + copy.channels[2] * 114) / 1000;
    return yiq < 128;
  }

  public static isLight(value: Color): boolean {
    return !Compute.isDark(value);
  }

  public static lighten(color: Color, amount: number = 0.25, clampValues = true) {
    const hsl = color.to('hsl', clampValues);
    hsl.channels[2] += hsl.ranges[2][1] * amount;
    return hsl.to(color.model, clampValues);
  }

  public static darken(color: Color, amount: number = 0.25, clampValues = true) {
    const hsl = color.to('hsl', clampValues);

    hsl.channels[2] -= hsl.channels[2] * amount;

    return hsl.to(color.model, clampValues);
  }

  public static negate(color: Color, clampValues = true) {
    const rgb = color.to('rgb', clampValues);
    for (let i = 0; i < 3; i++) {
      rgb.channels[i] = 255 - rgb.channels[i];
    }
    return rgb.to(color.model, clampValues);
  }

  public static saturate(color: Color, amount: number = 0.25, clampValues = true) {
    const hsl = color.to('hsl', clampValues);
    if (hsl.channels[1] > 0) {
      hsl.channels[1] += hsl.channels[1] * amount;
    } else {
      hsl.channels[1] = amount;
    }
    return hsl.to(color.model, clampValues);
  }

  public static desaturate(color: Color, amount: number = 0.25, clampValues = true) {
    const hsl = color.to('hsl', clampValues);
    hsl.channels[1] -= hsl.channels[1] * amount;
    return hsl.to(color.model, clampValues);
  }

  public static grayscale(color: Color, amount = 1, clampValues = true) {
    const rgb = color.to('rgb', clampValues);

    const gray = rgb.channels[0] * 0.21 * amount + rgb.channels[1] * 0.72 * amount + rgb.channels[2] * 0.07 * amount;
    rgb.channels = [gray, gray, gray, color.alpha];

    return rgb.to(color.model, clampValues);
  }

  public static rotate(color: Color, amount: number = 180, clampValues = true) {
    const hsl = color.to('hsl', clampValues);
    let hue = hsl.channels[0];
    hue = (((hue + amount) % 360) + 360) % 360;
    hsl.channels[0] = hue;
    return hsl.to(color.model);
  }

  public static luma(color: Color, clampValues = true): number {
    const rgb = color.to('rgb', clampValues);
    return (0.3 * rgb.channels[0] + 0.59 * rgb.channels[1] + 0.11 * rgb.channels[0]) / 255;
  }

  public static fade(color: Color, amount = 1, clampValues = true) {
    const copy = color.clone(clampValues);
    color.alpha = copy.alpha - copy.alpha * amount;
    if (clampValues) {
      color.alpha = Compute.clampValue(color.alpha, color.ranges[color.alphaIndex]);
    }
    return color;
  }

  public static opaque(color: Color, amount = 1, clampValues = true) {
    const copy = color.clone(clampValues);
    if (color.alpha > 0) {
      color.alpha = copy.alpha + copy.alpha * amount;
    } else {
      color.alpha = amount;
    }

    if (clampValues) {
      color.alpha = Compute.clampValue(color.alpha, color.ranges[color.alphaIndex]);
    }
    return color;
  }

  /**
   * Creates a Color array of n steps with the RGB gradient from source to destiny colors
   * @param source Color at start of gradient
   * @param destiny Color at the end of gradient
   * @param amount Number of steps in this gradient
   */
  public static steps(source: Color, destiny: Color, amount = 1): Color[] {
    if (amount < 0) {
      throw new Error('Cannot compute a gradient with negative steps');
    }

    const result = new Array<Color>();
    source = source.rgb();
    destiny = destiny.rgb();

    result.push(source);

    const sourchan = source.channels.map(o => o * o);
    sourchan[3] = source.alpha;
    const destchan = destiny.channels.map(o => o * o);
    destchan[3] = destiny.alpha;

    const stepSize = 1 / (amount + 1);
    let compt = 0;

    while (amount--) {
      compt += stepSize;

      const midchan = [];
      for (let i = 0; i < 3; i++) {
        midchan[i] = Math.sqrt(sourchan[i] * (1 - compt) + destchan[i] * compt);
      }

      midchan[3] = sourchan[3] * (1 - compt) + destchan[3] * compt;
      const mid = new Color(midchan, 'rgb', false);

      result.push(mid);
    }

    result.push(destiny);

    return result;
  }

  // According to https://sighack.com/post/averaging-rgb-colors-the-right-way, https://www.youtube.com/watch?v=LKnqECcg6Gw
  /**
   * Average color of the items in this Culture
   */
  public static average(values: Color[]): Color {
    if (values === undefined || values.length === 0) {
      throw new Error('Cannot compute average of an empty array of colors');
    }

    const result = new Color([0, 0, 0, 0], 'rgb', false);
    values.map(o => {
      const rgb = o.rgb();
      result.channels[0] += rgb.r() * rgb.r();
      result.channels[1] += rgb.g() * rgb.g();
      result.channels[2] += rgb.b() * rgb.b();
      result.channels[3] += rgb.alpha;
    });

    const size = values.length;

    result.channels[0] = Math.sqrt(result.channels[0] / size);
    result.channels[1] = Math.sqrt(result.channels[1] / size);
    result.channels[2] = Math.sqrt(result.channels[2] / size);
    result.channels[3] = result.channels[3] / size;
    return result;
  }

  public static mix(source: Color, destiny: Color, amount = 0.5, clampValues = true): Color {
    const copy = source.clone(false);
    destiny = destiny.to(copy.model, false);
    copy.channels.map((o, i, l) => {
      l[i] = l[i] + (destiny.channels[i] - l[i]) * amount;
    });
    if (clampValues) {
      copy.clamp(false);
    }
    return copy;
  }

  public static add(source: Color, destiny: Color, clampValues = true): Color {
    const copy = source.to(destiny.model, false);
    copy.channels.map((o, i, l) => {
      l[i] = l[i] + destiny.channels[i];
    });
    if (clampValues) {
      copy.clamp(false);
    }
    return copy;
  }
}
