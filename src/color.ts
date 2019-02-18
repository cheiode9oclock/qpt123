import { Base } from './base';
import { BaseFactory } from './base-factory';
import { Compute } from './compute';
import { Converter } from './converter';
import { Parser } from './parser';

export class Color {


  get alpha(): number {
    return this.base.channels[this.base.alphaIndex];
  }
  set alpha(value: number) {
    this.base.channels[this.base.alphaIndex] = value;
  }

  get channels(): number[] {
    return this.base.channels;
  }
  set channels(value: number[]) {
    if (value !== undefined) {
      this.base.channels = [...value];
    }
  }

  get ranges(): any[] {
    return this.base.ranges;
  }

  get model(): string {
    return this.base.model;
  }

  get rgba(): string {
    return 'rgba(' + this.to('rgb').channels.join() + ')';
  }

  get hex(): string {

    const rgb = this.to('rgb');

    let result = '';
    let asNumber = 0;

    for (let i = 0; i < 3; i++) {
      asNumber = rgb.channels[i]; // Color.clamp(Number(rgb.channels[i]), 0, 255, 0);
      result += ('0' + (Number(asNumber.toFixed(0)).toString(16))).slice(-2).toUpperCase();
    }

    // console.log(rgb.channels.join(), rgb.alpha * 255);
    // asNumber = Number((rgb.alpha * 255).toFixed(0)); // Color.clamp(Number(rgb.alpha) * 255, 0, 255, 0);
    // result += ('0' + (asNumber.toString(16))).slice(-2).toUpperCase();
    result += ('0' + (Number((rgb.alpha * 255).toFixed(0))).toString(16)).slice(-2).toUpperCase();
    return result;
  }

  protected base: Base;

  constructor(value?: any, ranges?: number[][], model = 'Color', alphaIndex = 3, clampValues = true) {
    if (value instanceof Base) {
      this.base = new Base(value.channels, value.ranges, value.model, value.alphaIndex);
    } else if (value instanceof String) {
      this.base = Parser.fromString(value.toString());
    } else {
      this.base = new Base(value, ranges, model, alphaIndex);
    }
    // this.channels = value;
    if (clampValues) {
      this.clamp(this.base.channels, this.base.ranges);
    }

  }

  /**
   * Clamp and return value rounded to precision
   */
  public clamp(values?: number[], ranges?: any): number[] {

    if (values === undefined) {
      values = this.base.channels;
    }

    if (ranges === undefined) {
      ranges = this.base.ranges;
    }

    return Compute.clamp(values, ranges);
  }

  public clone(): Color {
    return new Color(this.base);
  }

  public to(model = ''): Color {
    const copy = this.clone();
    Converter.convert(copy.base, model);
    return copy;
  }

  public add(other: Color): Color {
    const copy = this.to(other.model);
    copy.channels.map((o, i, l) => {
      l[i] = l[i] + other.channels[i];
    });
    return copy;
  }

  public mix(other: Color, amount: number = 0.5): Color {
    const copy = this.clone();
    other = other.to(this.model);
    copy.channels.map((o, i, l) => {
      l[i] = l[i] + (other.channels[i] - l[i]) * amount;
    });
    return copy;
  }

  public blacken(amount: number = 0.25) {
    return this.mix(new Color([0, 0, 0, this.alpha], [[0, 255], [0, 255], [0, 255], [0, 1]], 'rgb', 3), amount);
  }

  public whiten(amount: number = 0.25) {
    return this.mix(new Color([255, 255, 255, this.alpha], [[0, 255], [0, 255], [0, 255], [0, 1]], 'rgb', 3), amount);
  }

  public lighten(amount: number = 0.25) {
    return Compute.lighten(this, amount);
  }

  public darken(amount: number = 0.25) {
    return Compute.darken(this, amount);
  }

  public invert() {
    return Compute.invert(this);

  }

  public saturate(amount: number = 0.25) {
    return Compute.saturate(this, amount);
  }

  public desaturate(amount: number = 0.25) {
    return Compute.desaturate(this, amount);
  }

  public grayscale(amount = 1) {
    return Compute.grayscale(this, amount);
  }

  public rotate(amount: number = 180) {
    return Compute.rotate(this, amount);
  }

  public luma() {
    return Compute.luma(this);

    // const rgb = this.to('rgb');
    // return (0.3 * rgb.channels[0] + 0.59 * rgb.channels[1] + 0.11 * rgb.channels[0]) / 255;
  }

  public toString(): string {
    return this.base.model + '(' + this.base.channels.join() + ')';
  }



}
