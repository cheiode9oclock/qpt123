import { Base } from './base';
import { BaseFactory } from './base-factory';
import { Web } from './web';

export class Parser {

  public static fromString(val: string): Base {

    val = val.toLowerCase();
    let array;
    let alpha = 1;

    // check for #hex
    if (val.substr(0, 1) === '#') {

      array = Parser.ChannelsFromHEX(val.substr(1));

      if (array) {
        return BaseFactory.createRGB(array);
      }
    } else if (val.substr(0, 3) === 'rgb') {

      // check for syntax
      const values: string[] = Parser.extractValues(val);

      if (values.length > 3) {
        alpha = Parser.parseAlpha(values.pop() as string) * 1;
        alpha = alpha < 0 ? 0 : alpha > 1 ? 1 : alpha;
      }

      if (values.length < 3) {
        throw new Error('Invalid value, an RGB model should have at least three parameters');
      }

      // all values have % or none, otherwise issue an error
      // 0 means we haven't started checking yet
      // 1 the value has no %
      // 2 the value has a %
      let allOrNone = '';
      array = [];
      let asNumber;

      for (let i = 0; i < 3; i++) {

        const checkOne = values[i].endsWith('%') ? '%' : '-';
        if (allOrNone === '') {
          allOrNone = checkOne;
        } else if (allOrNone !== checkOne) {
          throw new Error('Don\'t mix integers and percentages.');
        }

        if (checkOne === '%') {

          asNumber = Number(values[i].slice(0, -1));
          asNumber = Math.round(asNumber / 100 * 255);

        } else {

          asNumber = Number(values[i]);
          asNumber = asNumber < 0 ? 0 : asNumber > 255 ? 255 : asNumber;
        }

        array.push(asNumber);

      }

      array.push(alpha);

      return BaseFactory.createRGB(array);

    } else if (Web.named.has(val)) {

      return Parser.fromString(Web.named.get(val) as string);

    } else if (val.substr(0, 3) === 'hsl') {

      // check for syntax
      const values: string[] = this.extractValues(val);

      if (values.length > 3) {
        alpha = Parser.parseAlpha(values.pop() as string);
      }

      if (values.length < 3) {
        throw new Error('Invalid value, an HSL model should have at least three parameters');
      }

      const hue = values[0];
      const sat = values[1];
      const lgt = values[2];
      let h: number;
      let s: number;
      let l: number;

      if (hue.endsWith('deg')) {
        // exclude "deg" from end of string and "rotate around" 360 to shed exceeding turns
        h = Number(hue.slice(0, -3)) % 360;
        if (h < 0) {
          h = 360 + h;
        }
      } else if (hue.endsWith('turn')) {
        h = Number(hue.slice(0, -4)); // exclude "turn" from end of string
        if (Math.abs(h) > 1) {
          h = h - Math.floor(h); // 4 - 4.75 = 0.75
        }
        if (h < 1) {
          h = 1 + h;
        }
        h = 360 * h;

      } else if (hue.endsWith('rad')) {
        h = (Math.abs(Number(hue.slice(0, -3))) * 180 / Math.PI) % 360;

      } else {
        h = Number(hue);
      }
      if (Number.isNaN(h)) {
        throw new Error('Invalid value for hue');
      }

      s = Parser.roundPercentage(sat, 100);

      if (Number.isNaN(s)) {
        throw new Error('Invalid value for saturation');
      }

      l = Parser.roundPercentage(lgt, 100);
      if (Number.isNaN(l)) {
        throw new Error('Invalid value for lightness');
      }

      const hsl = BaseFactory.createHSL([h, s, l, alpha]);
      return hsl;

    }
    throw new Error('Parser couldn\'t understand value: ' + val);


  }

  public static ChannelsFromHEX(val: string): number[] | null {

    if (val.length < 3) {
      return null;
    }

    if (val.length < 6) {
      let res = '';
      const size = val.length - 1;

      for (let i = size; i > -1; i--) {
        res = val.substr(i, 1) + val.substr(i, 1) + res;
      }
      val = res;
    }

    if (val.length === 6) {
      val += 'FF';
    }
    return [
      parseInt(val.substr(0, 2), 16),
      parseInt(val.substr(2, 2), 16),
      parseInt(val.substr(4, 2), 16),
      parseInt(val.substr(6, 2), 16) / 255,
    ];
  }

  /**
   * parse string and return as number takint into acount if it's a percentage
   */
  public static parseAlpha(alp: string): number {

    if (!alp.endsWith('%')) {

      return Number(alp);

    } else {

      return Number(alp.slice(0, -1)) / 100;

    }
  }

  /**
   * return round value of calculate percentage
   */
  public static roundPercentage(val: string, perc: number): number {
    let result: number;
    if (val.endsWith('%')) {
      result = Number(val.slice(0, -1));
      result = Math.round(result / 100 * perc);
    } else {
      result = Math.round(Number(val));
    }
    return result;
  }


  /**
   * transform string into array of values
   * @param val string in formats (0%,50%,100%), (0,0,0 / 0.4), (20,30,40,0.1), (270,60%,70%)
   */
  public static extractValues(val: string): string[] {

    // if it's , separated make it space separated
    // in order to use only one method to split values
    if (val.indexOf(',') > -1) {
      val = val.replace(/,/g, ' ');
    }

    // then it must be divided by blank spaces
    // ending white spaces are trimmed down to not create empty values
    const result = val.split('(')[1].trim().split(')')[0].trim().split(/\s+/g);

    return result;
  }
}
