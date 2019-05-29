import { Base } from './base';
import { BaseFactory } from './base-factory';
// import { Compute } from './compute';
import { Converter } from './converter';
import { Parser } from './parser';

export class Color {

  public base: Base;

  /**
   * get alpha channel value
   */
  get alpha(): number {
    return this.base.channels[this.base.alphaIndex];
  }

  /**
   * set alpha channel value
   */
  set alpha(value: number) {
    this.base.channels[this.base.alphaIndex] = value;
  }

  get alphaIndex(): number {
    return this.base.alphaIndex;
  }

  get channels(): number[] {
    return this.base.channels;
  }

  set channels(value: number[]) {
    if (value !== undefined) {
      this.base.channels = [...value];
    }
  }

  /**
   * returns a random color based on ranges
   * @param opaque If alpha channel should be excluded from random, defaults to true
   */
  random(opaque = true) {
    const c = new Array<number>(this.channels.length);

    this.ranges.map((o, i) => {
      if (i == this.alphaIndex && opaque) {
        c[i] = this.ranges[i][1];
      } else {
        c[i] = Math.random() * (this.ranges[i][1] - this.ranges[i][0]) + this.ranges[i][0];
      }
    })
    return new Color(c, this.model);
  }

  /**
   * Ranges of minium and maximum values channels may be set to.
   * Ranges are used when clamping said values.
   */
  get ranges(): any[] {
    return this.base.ranges;
  }

  /**
   * Returns this color type model. For example a color instance of RGB class will return RGB.MODEL, ie "rgb".
   */
  get model(): string {
    return this.base.model;
  }

  /**
   * CSS helper method
   * Clamp, and returns this color as a string using rgba as its model
   */
  get rgba(): string {
    return 'rgba(' + this.to('rgb').channels.join() + ')';
  }

  /**
   * returns hexadecimal version of this color WITHOUT alpha channel
   */
  get hex(): string {
    const result = this.hexa;
    return result.substr(0, 6);
  }

  /**
   * returns hexadecimal version of this color with alpha channel
   */
  get hexa(): string {
    const rgb = this.to('rgb');

    let result = '';
    let asNumber = 0;

    for (let i = 0; i < 3; i++) {
      asNumber = rgb.channels[i]; // Color.clamp(Number(rgb.channels[i]), 0, 255, 0);
      result += ('0' + Number(asNumber.toFixed(0)).toString(16)).slice(-2).toUpperCase();
    }

    result += ('0' + Number((rgb.alpha * 255).toFixed(0)).toString(16)).slice(-2).toUpperCase();
    return result;
  }

  get isDark(): boolean {
    // return Compute.isDark(this);

    // YIQ equation from http://24ways.org/2010/calculating-color-contrast
    const copy = this.rgb();
    const yiq = (copy.channels[0] * 299 + copy.channels[1] * 587 + copy.channels[2] * 114) / 1000;
    return yiq < 128;
  }

  get isLight(): boolean {
    // return Compute.isLight(this);
    return !this.isDark;
  }

  /**
   * Create a new color.
   * @param value Values that will compose this color
   * @param model Model to which this color will be outputed.
   * @param clampValues Should channels values be kept with range? Defaults to true.
   */
  constructor(
    value?: any,
    model = 'rgb',
    clampValues = true,
  ) {
    if (value instanceof Base) {
      this.base = new Base(value.channels, value.ranges, value.model, value.alphaIndex, value.clampFunction);
    } else if (typeof value === 'string') {
      this.base = Parser.fromString(value.toString(), clampValues);
    } else {
      this.base = BaseFactory.createGeneric(value, model, clampValues);
    }

    if (clampValues) {
      this.clamp(false);
    }
  }

  /**
   * Clamp and return value to stay inside range
   * @param value Value to be clamped
   * @param range Two numbers array, index 0 is the minimum , index 1 is the maximum
   */
  public clampValue(value: number, range: number[]): number {
    return range[0] > value ? range[0] : range[1] < value ? range[1] : value;
  }

  public clampRotation(value: number): number {
    if (value === Infinity || value === -Infinity) {
      return 0;
    }
    return ((value % 360) + 360) % 360;
  }

  public channel(model: string = 'rgb', index: number = 0, value?: number, clampValues = true) {
    const clone = this.to(model, clampValues);

    if (value !== undefined) {
      clone.base.channels[index] = value;
      if (clampValues) {
        clone.base.channels[index] = this.clampValue(clone.channels[index], clone.ranges[index]);
      }
      return clone;
    }

    return clone.channels[index];
  }

  /**
   * Creates an RGB clone and set Red channel to value, or returns Red channel's value
   * @param value Red channel value
   * @param clampValues Keep value in range, defaults to true
   */
  public r(value?: number, clampValues = true): any {
    return this.channel('rgb', 0, value, clampValues);
  }
  /**
   * Creates an RGB clone and set Green channel to value, or returns Green channel's value
   * @param value Green channel value
   * @param clampValues Keep value in range, defaults to true
   */
  public g(value?: number, clampValues = true): any {
    return this.channel('rgb', 1, value, clampValues);
  }
  /**
   * Creates an RGB clone and set Blue channel to value, or returns Blue channel's value
   * @param value Blue channel value
   * @param clampValues Keep value in range, defaults to true
   */
  public b(value?: number, clampValues = true): any {
    return this.channel('rgb', 2, value, clampValues);
  }

  /**
   * Creates an HSL clone and set Hue channel to value, or returns Hue channel's value
   * @param value Hue channel value
   * @param clampValues Keep value in range, defaults to true
   */
  public h(value?: number, clampValues = true): any {
    const clone = this.to('hsl', clampValues);

    if (value !== undefined) {
      clone.base.channels[0] = value;
      if (clampValues) {
        clone.base.channels[0] = this.clampRotation(clone.channels[0]);
      }
      return clone;
    }

    return clone.channels[0];
  }
  /**
   * Creates an HSL clone and set Saturation channel to value, or returns Saturation channel's value
   * @param value Saturation channel value
   * @param clampValues Keep value in range, defaults to true
   */
  public s(value?: number, clampValues = true): any {
    return this.channel('hsl', 1, value, clampValues);
  }

  /**
   * Creates an HSL clone and set Lightness channel to value, or returns Lightness channel's value
   * @param value Lightness channel value
   * @param clampValues Keep value in range, defaults to true
   */
  public l(value?: number, clampValues = true): any {
    return this.channel('hsl', 2, value, clampValues);
  }

  /**
   * Clamp channels values based on color's own ranges
   * @param makeCopy True return a copy of this color, false just modify this color's channels
   */
  public clamp(makeCopy = true): Color {
    if (makeCopy) {
      return this.clone(true);
    } else {
      this.base.clamp();
      return this;
    }
  }

  /**
   * Return a copy of this color
   * @param clampValues Default is true, clamp channels this clone
   */
  public clone(clampValues = true): Color {
    return new Color(this.base, this.model, clampValues);
  }

  /**
   * Convert this color to another color model
   * @param model Model to which this color should be converted
   * @param clampValues Default is true, clamp channels of the color returned
   */
  public to(model = '', clampValues = true): Color {
    const copy = this.clone(clampValues);
    copy.base = Converter.convert(copy.base, model, clampValues);
    return copy;
  }

  /**
   * Returns a copy of this color converted to  RGB model
   * @param clampValues Default is true, clamp channels of the color returned
   */
  public rgb(clampValues = true): Color {
    return this.to('rgb', clampValues);
  }

  /**
   * Returns a copy of this color converted to HSL model
   * @param clampValues Default is true, clamp channels of the color returned
   */
  public hsl(clampValues = true): Color {
    return this.to('hsl', clampValues);
  }

  /**
   * Returns a copy of this color converted to CMYK model
   * @param clampValues Default is true, clamp channels of the color returned
   */
  public cmyk(clampValues = true): Color {
    return this.to('cmyk', clampValues);
  }

  /**
   * Returns a copy of this color converted to LAB model
   * @param clampValues Default is true, clamp channels of the color returned
   */
  public lab(clampValues = true): Color {
    return this.to('lab', clampValues);
  }

  /**
   * Returns a copy of this color converted to XYZ model
   * @param clampValues Default is true, clamp channels of the color returned
   */
  public xyz(clampValues = true): Color {
    return this.to('xyz', clampValues);
  }

  public add(other: Color, clampValues = true): Color {
    // return Compute.add(this, other, clampValues);
    const copy = this.to(other.model, false);
    copy.channels.map((o, i, l) => {
      l[i] = l[i] + other.channels[i];
    });
    if (clampValues) {
      copy.clamp(false);
    }
    return copy;
  }

  public mix(other: Color, amount: number = 0.5, clampValues = true): Color {
    // return Compute.mix(this, other, amount, clampValues);
    const copy = this.clone(false);
    other = other.to(copy.model, false);
    copy.channels.map((o, i, l) => {
      l[i] = l[i] + (other.channels[i] - l[i]) * amount;
    });
    if (clampValues) {
      copy.clamp(false);
    }
    return copy;
  }

  public blacken(amount: number = 0.25, clampValues = true) {
    return this.mix(
      new Color([0, 0, 0, this.alpha]),
      amount,
    );
  }

  public whiten(amount: number = 0.25, clampValues = true) {
    return this.mix(
      new Color([255, 255, 255, this.alpha]),
      amount,
    );
  }

  public lighten(amount: number = 0.25, clampValues = true) {
    // return Compute.lighten(this, amount, clampValues);
    const hsl = this.to('hsl', clampValues);
    hsl.channels[2] += hsl.ranges[2][1] * amount;
    return hsl.to(this.model, clampValues);
  }

  public darken(amount: number = 0.25, clampValues = true) {
    // return Compute.darken(this, amount, clampValues);
    const hsl = this.to('hsl', clampValues);

    hsl.channels[2] -= hsl.channels[2] * amount;

    return hsl.to(this.model, clampValues);
  }

  public negate(clampValues = true) {
    // return Compute.negate(this, clampValues);
    const rgb = this.to('rgb', clampValues);
    for (let i = 0; i < 3; i++) {
      rgb.channels[i] = 255 - rgb.channels[i];
    }
    return rgb.to(this.model, clampValues);
  }

  public saturate(amount: number = 0.25, clampValues = true) {
    // return Compute.saturate(this, amount, clampValues);
    const hsl = this.to('hsl', clampValues);
    if (hsl.channels[1] > 0) {
      hsl.channels[1] += hsl.channels[1] * amount;
    } else {
      hsl.channels[1] = amount;
    }
    return hsl.to(this.model, clampValues);
  }

  public desaturate(amount: number = 0.25, clampValues = true) {
    // return Compute.desaturate(this, amount, clampValues);
    const hsl = this.to('hsl', clampValues);
    hsl.channels[1] -= hsl.channels[1] * amount;
    return hsl.to(this.model, clampValues);
  }

  public grayscale(amount = 1, clampValues = true) {
    // return Compute.grayscale(this, amount, clampValues);
    const rgb = this.to('rgb', clampValues);

    const gray = rgb.channels[0] * 0.21 * amount + rgb.channels[1] * 0.72 * amount + rgb.channels[2] * 0.07 * amount;
    rgb.channels = [gray, gray, gray, this.alpha];

    return rgb.to(this.model, clampValues);
  }

  public rotate(amount: number = 180, clampValues = true) {
    // return Compute.rotate(this, amount, clampValues);
    const hsl = this.to('hsl', clampValues);
    let hue = hsl.channels[0];
    hue = (((hue + amount) % 360) + 360) % 360;
    hsl.channels[0] = hue;
    return hsl.to(this.model);
  }

  public luma(clampValues = true) {
    // return Compute.luma(this, clampValues);
    const rgb = this.to('rgb', clampValues);
    return (0.3 * rgb.channels[0] + 0.59 * rgb.channels[1] + 0.11 * rgb.channels[0]) / 255;
  }

  public toString(): string {
    return this.base.model + '(' + this.base.channels.join() + ')';
  }
}
