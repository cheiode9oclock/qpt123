import * as path from 'ngraph.path';
import { Base } from './base';
import { BaseFactory } from './base-factory';

export class Converter {
  // used to register standard conversions when a conversion is requested for the first time
  public static initied = false;

  /**
   * Assigns a function to string pair FROM, TO, the function must be able to convert between color models
   * @param from Color signature from wich the conversion will be made, eg: "RGB"
   * @param to Color signature to wich the conversion will be made, eg: "HSL"
   * @param func Function that does the color conversion
   */
  public static register(from: string, to: string, func: (n: any) => any) {
    Converter.conversions.set(from + '_' + to, func);

    Converter.graph.addNode(from);
    Converter.graph.addNode(to);
    Converter.graph.addLink(from, to);
  }

  /**
   * Return true if there's a function registered to this pair of color models, returns false otherwise.
   * @param from Color model signature from which color will be converted
   * @param to Color model signature to which color will be converted
   */
  public static has(from: string, to: string): boolean {
    return Converter.conversions.has(from + '_' + to);
  }

  public static init() {
    Converter.register('hsl', 'rgb', Converter.hsl_rgb);
    Converter.register('rgb', 'hsl', Converter.rgb_hsl);
    Converter.register('rgb', 'xyz', Converter.rgb_xyz);
    Converter.register('xyz', 'rgb', Converter.xyz_rgb);
    Converter.register('lab', 'xyz', Converter.lab_xyz);
    Converter.register('xyz', 'lab', Converter.xyz_lab);
    Converter.register('rgb', 'cmyk', Converter.rgb_cmyk);
    Converter.register('cmyk', 'rgb', Converter.cmyk_rgb);
    Converter.initied = true;
  }

  /**
   * Converts between color models
   * @param from Color model signature from which color will be converted
   * @param to Color model signature to which color will be converted
   */
  public static convert(from: Base, to: string, clampValues = true): Base {
    // do not convert to same color model
    if (from.model === to) {
      return from;
    }

    if (!Converter.initied) {
      Converter.init();
    }

    const pair = from.model + '_' + to;

    let p = null;
    let result = from;
    const pathFinder = path.aStar(Converter.graph);
    try {
      p = pathFinder.find(from.model, to);
    } catch (e) {
      throw new Error("It wasn't possible to convert: " + pair);
    }

    if (p) {
      // first step is equal to color from, so remove it in order to save processing
      // and go directly to second step
      p.reverse();
      p.shift();

      for (const index in p) {
        if (result.model !== p[index].id) {
          const func = Converter.conversions.get(result.model + '_' + p[index].id);
          if (func !== undefined) {
            result = func(result, clampValues);
          } else {
            throw new Error("Conveter couldn't find caller to: " + (result.model + '_' + p[index].id));
          }
        }
      }
      return result;
    }
    throw new Error("It wasn't possible to convert: " + pair);
  }

  public static hsl_rgb(value: Base, clampValues = true): Base {
    const h = value.channels[0] / 360;
    const s = value.channels[1] / 100;
    const l = value.channels[2] / 100;
    let t1;
    let t2;
    let t3;
    let rgb;
    let val;

    if (s === 0) {
      val = l * 255;
      value.channels = [val, val, val, value.alpha];
      value.ranges = [[0, 255], [0, 255], [0, 255], [0, 1]];
      value.model = 'rgb';
      return value;
    }

    if (l < 0.5) {
      t2 = l * (1 + s);
    } else {
      t2 = l + s - l * s;
    }

    t1 = 2 * l - t2;

    rgb = [0, 0, 0];
    for (let i = 0; i < 3; i++) {
      t3 = h + (1 / 3) * -(i - 1);
      if (t3 < 0) {
        t3++;
      }
      if (t3 > 1) {
        t3--;
      }

      if (6 * t3 < 1) {
        val = t1 + (t2 - t1) * 6 * t3;
      } else if (2 * t3 < 1) {
        val = t2;
      } else if (3 * t3 < 2) {
        val = t1 + (t2 - t1) * (2 / 3 - t3) * 6;
      } else {
        val = t1;
      }

      rgb[i] = val * 255;
    }

    return BaseFactory.createRGB([rgb[0], rgb[1], rgb[2], value.alpha], clampValues);
  }

  public static rgb_hsl(value: Base, clampValues = true): Base {
    const fr = value.channels[0] / 255;
    const fg = value.channels[1] / 255;
    const fb = value.channels[2] / 255;
    const min = Math.min(fr, fg, fb);
    const max = Math.max(fr, fg, fb);
    const delta = max - min;
    let h = 0;
    let s;
    let l;

    if (max === min) {
      h = 0;
    } else if (fr === max) {
      h = (fg - fb) / delta;
    } else if (fg === max) {
      h = 2 + (fb - fr) / delta;
    } else if (fb === max) {
      h = 4 + (fr - fg) / delta;
    }

    h = Math.min(h * 60, 360);

    if (h < 0) {
      h += 360;
    }

    l = (min + max) / 2;

    if (max === min) {
      s = 0;
    } else if (l <= 0.5) {
      s = delta / (max + min);
    } else {
      s = delta / (2 - max - min);
    }

    return BaseFactory.createHSL([h, s * 100, l * 100, value.alpha], clampValues);
  }

  public static xyz_rgb(value: Base, clampValues = true) {
    const x = value.channels[0] / 100;
    const y = value.channels[1] / 100;
    const z = value.channels[2] / 100;
    let r = 0;
    let g = 0;
    let b = 0;

    // assume sRGB
    // http://www.brucelindbloom.com/index.html?Eqn_RGB_XYZ_Matrix.html
    r = x * 3.240969941904521 + y * -1.537383177570093 + z * -0.498610760293;
    g = x * -0.96924363628087 + y * 1.87596750150772 + z * 0.041555057407175;
    b = x * 0.055630079696993 + y * -0.20397695888897 + z * 1.056971514242878;

    r = r > 0.0031308 ? 1.055 * Math.pow(r, 1.0 / 2.4) - 0.055 : (r = r * 12.92);

    g = g > 0.0031308 ? 1.055 * Math.pow(g, 1.0 / 2.4) - 0.055 : (g = g * 12.92);

    b = b > 0.0031308 ? 1.055 * Math.pow(b, 1.0 / 2.4) - 0.055 : (b = b * 12.92);

    r = Math.min(Math.max(0, r), 1);
    g = Math.min(Math.max(0, g), 1);
    b = Math.min(Math.max(0, b), 1);

    return BaseFactory.createRGB([r * 255, g * 255, b * 255, value.alpha], clampValues);
  }

  public static rgb_xyz(value: Base, clampValues = true): Base {
    let r = value.channels[0] / 255;
    let g = value.channels[1] / 255;
    let b = value.channels[2] / 255;

    // assume sRGB
    r = r > 0.04045 ? Math.pow((r + 0.055) / 1.055, 2.4) : r / 12.92;
    g = g > 0.04045 ? Math.pow((g + 0.055) / 1.055, 2.4) : g / 12.92;
    b = b > 0.04045 ? Math.pow((b + 0.055) / 1.055, 2.4) : b / 12.92;

    const x = r * 0.41239079926595 + g * 0.35758433938387 + b * 0.18048078840183;
    const y = r * 0.21263900587151 + g * 0.71516867876775 + b * 0.072192315360733;
    const z = r * 0.019330818715591 + g * 0.11919477979462 + b * 0.95053215224966;

    const result = BaseFactory.create(
      [x * 100, y * 100, z * 100, value.alpha],
      clampValues,
      [[0, 100], [0, 100], [0, 100], [0, 1]],
      'xyz',
      3,
    );
    return result;
  }

  public static xyz_lab(value: Base, clampValues = true): Base {
    let x = value.channels[0];
    let y = value.channels[1];
    let z = value.channels[2];
    let l = 0;
    let a = 0;
    let b = 0;

    x /= 95.047;
    y /= 100;
    z /= 108.883;

    x = x > 0.008856 ? Math.pow(x, 1 / 3) : 7.787 * x + 16 / 116;
    y = y > 0.008856 ? Math.pow(y, 1 / 3) : 7.787 * y + 16 / 116;
    z = z > 0.008856 ? Math.pow(z, 1 / 3) : 7.787 * z + 16 / 116;

    l = 116 * y - 16;
    a = 500 * (x - y);
    b = 200 * (y - z);

    const result = BaseFactory.create(
      [l, a, b, value.alpha],
      clampValues,
      [[0, 100], [-128, 128], [-128, 128], [0, 1]],
      'lab',
      3,
    );
    return result;
  }

  public static lab_xyz(value: Base, clampValues = true): Base {
    let l = (value.channels[0] + 16) / 116.0;
    let a = l + value.channels[1] / 500.0;
    let b = l - value.channels[2] / 200.0;

    const stimulus = [95.047, 100.0, 108.883];

    a = a * a * a > 8856e-6 ? a * a * a : (-16.0 / 116.0 + a) / 7.787;
    l = l * l * l > 8856e-6 ? l * l * l : (-16.0 / 116.0 + l) / 7.787;
    b = b * b * b > 8856e-6 ? b * b * b : (-16.0 / 116.0 + b) / 7.787;

    const x = stimulus[0] * a;
    const y = stimulus[2] * l;
    const z = stimulus[1] * b;

    const result = BaseFactory.create(
      [x, y, z, value.alpha],
      clampValues,
      [[0, 100], [0, 100], [0, 100], [0, 1]],
      'xyz',
      3,
    );
    return result;
  }

  public static cmyk_rgb(value: Base, clampValues = true): Base {
    const fc = value.channels[0] / 100;
    const fm = value.channels[1] / 100;
    const fy = value.channels[2] / 100;
    const fk = value.channels[3] / 100;

    const r = 1 - Math.min(1, fc * (1 - fk) + fk);
    const g = 1 - Math.min(1, fm * (1 - fk) + fk);
    const b = 1 - Math.min(1, fy * (1 - fk) + fk);

    const result = BaseFactory.createRGB([r * 255, g * 255, b * 255, value.alpha], clampValues);

    return result;
  }

  public static rgb_cmyk(value: Base, clampValues = true): Base {
    const fr = value.channels[0] / 255;
    const fg = value.channels[1] / 255;
    const fb = value.channels[2] / 255;

    const k = Math.min(1 - fr, 1 - fg, 1 - fb);
    const c = (1 - fr - k) / (1 - k) || 0;
    const m = (1 - fg - k) / (1 - k) || 0;
    const y = (1 - fb - k) / (1 - k) || 0;

    const result = BaseFactory.create(
      [c * 100, m * 100, y * 100, k * 100, value.alpha],
      clampValues,
      [[0, 100], [0, 100], [0, 100], [0, 100], [0, 1]],
      'cmyk',
      4,
    );
    return result;
  }

  /**
   * internal list of conversion functions
   */
  protected static conversions = new Map<string, (n: any, clampValues: boolean) => any>();

  /**
   * internal graph of conversion functions, used to find shortest path between functions
   */
  protected static createGraph = require('ngraph.graph');
  protected static graph = Converter.createGraph();
}
