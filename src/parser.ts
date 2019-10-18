import { Base } from './base';
import { BaseFactory } from './base-factory';
import { Named } from './named';

export class Parser {
  public static fromString(val: string, clampValues: boolean = true): Base {
    val = val.toLowerCase();
    let array;
    let alpha = 1;
    let prefix = '';
    const splitValue = val.split("(");
    if(splitValue.length > 1){
      prefix = splitValue[0].trim();
    }

    // check for #hex
    if (val.substr(0, 1) === '#') {
      array = Parser.ChannelsFromHEX(val.substr(1));

      if (array) {
        return BaseFactory.createRGB(array);
      }


    } else if (prefix === 'rgb' || prefix === 'rgba') {
      
      const values: string[] = Parser.extractValues(val);

      if (values.length > 3) {
        alpha = Parser.getPercentage(values.pop() as string) * 1;
      }

      if (values.length < 3) {
        throw new Error('Parser invalid value, an RGB model should have at least three parameters');
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
          throw new Error("Parser couldn't understand mixed integers and percentages.");
        }

        if (checkOne === '%') {
          asNumber = Number(values[i].slice(0, -1));
          asNumber = Math.round((asNumber / 100) * 255);
        } else {
          asNumber = Number(values[i]);
        }

        array.push(asNumber);
      }

      array.push(alpha);

      return BaseFactory.createRGB(array, clampValues);


    } else if (Named.css.has(val)) {
      return Parser.fromString(Named.css.get(val) as string);


    } else if (prefix === 'hsl' || prefix === 'hsla') {
      
      const values: string[] = this.extractValues(val);

      if (values.length > 3) {
        alpha = Parser.getPercentage(values.pop() as string);
      }

      if (values.length < 3) {
        throw new Error('Parser invalid value, an HSL model should have at least three parameters');
      }

      const hue = values[0];
      const sat = values[1];
      const lgt = values[2];
      let h: number;
      let s: number;
      let l: number;

      if (hue.endsWith('deg')) {
        // exclude "deg" from end of string and "rotate around" 360 to shed exceeding turns
        h = Number(hue.slice(0, -3));

      } else if (hue.endsWith('turn')) {
        h = Number(hue.slice(0, -4)); // exclude "turn" from end of string

        h = 360 * h;
      } else if (hue.endsWith('rad')) {
        h = ((Math.abs(Number(hue.slice(0, -3))) * 180) / Math.PI);
      } else {
        h = Number(hue);
      }
      if (Number.isNaN(h)) {
        throw new Error('Parser invalid value for hue');
      }

      s = Parser.getPercentage(sat, 100);

      if (Number.isNaN(s)) {
        throw new Error('Parser invalid value for saturation');
      }

      l = Parser.getPercentage(lgt, 100);
      
      if (Number.isNaN(l)) {
        throw new Error('Parser invalid value for lightness');
      }

      return BaseFactory.createHSL([h, s, l, alpha], clampValues);


    } else if (prefix === 'cmyk') {

      const values = this.extractValues(val).map(e=>Number(e));

      if (values.length === 4) {
        values.push(1);
      }

      return BaseFactory.createCMYK(values, clampValues);

    }
    
    if(prefix){
      const values = this.extractValues(val).map(e=>Number(e));
      
      const tryBase = BaseFactory.createGeneric(values, prefix, clampValues);
      if(tryBase){
        return tryBase;
      }
    }

    throw new Error("Parser couldn't understand value: " + val);
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
   * parse string and return as number taking into acount if it's a percentage
   */
  public static getPercentage(val: string, perc = 100): number {
    if (!val.endsWith('%')) {
      return Number(val);
    } else {
      return Number(val.slice(0, -1)) / perc;
    }
  }

  /**
   * return round value of calculate percentage
   */
  public static roundPercentage(val: string, perc: number): number {
    let result: number;
    if (val.endsWith('%')) {
      result = Number(val.slice(0, -1));
      result = Math.round((result / 100) * perc);
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
    const result = val
      .split('(')[1]
      .trim()
      .split(')')[0]
      .trim()
      .split(/\s+/g);

    return result;
  }
}
