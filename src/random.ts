import { RGB } from './models/rgb';
import { HSL } from './models/hsl';

export class Random {

  static shades = ['light', 'medium', 'dark'];
  // tones = ['red', 'orange', 'yellow', 'green', 'blue', 'purple', 'white', 'gray', 'black', 'brown', 'pink', 'violet', 'grey'];
  static names = ['red', 'green', 'blue', 'white', 'gray', 'black', 'grey'];
  static codeNames = [
    [0, 100, 50],
    [120, 100, 50],
    [240, 100, 50],
    [0, 0, 100],
    [0, 0, 50],
    [0, 0, 0],
    [0, 0, 50]
  ];
  static codeShades = [100, 50, 0];

  static pick(name = '', shade = '', to = 'RGB') {

    const range = 20;

    let values = [this.rand(360), this.rand(100), this.rand(100), 1];

    if (name !== '') {

      const colorIndex = Random.names.indexOf(name);

      if (colorIndex === -1) {
        throw new Error('Color name not recognized');
      } else {
        values = Random.codeNames[colorIndex];
      }

      let shadeIndex = -1;
      if (shade !== '') {
        shadeIndex = Random.shades.indexOf(shade);
        if (shadeIndex === -1) {
          throw new Error('Shade name not recognized');
        } else {
          values[2] = Random.codeShades[shadeIndex];
        }
      }

      values[0] += Random.rand(3);
      values[2] += Random.rand(range * 2) - range;

      values[3] = 1;

    }

    return new HSL(values);

  }

  static rand(value = 255) {
    return Math.random() * value;
  }

}
