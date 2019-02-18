import { Base } from './base';

export class BaseFactory {
  static createRGB(values = [0, 0, 0, 1]): Base {
    return new Base(values, [[0, 255], [0, 255], [0, 255], [0, 1]], 'rgb', 3);
  }

  static createHSL(values = [0, 0, 0, 1]): Base {
    return new Base(values, [[0, 359], [0, 100], [0, 100], [0, 1]], 'hsl', 3);
  }
}
