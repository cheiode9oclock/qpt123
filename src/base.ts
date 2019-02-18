export class Base {

  public model = 'Base';
  public alphaIndex = 0;
  public ranges: number[][] = [];
  public channels: number[] = [];

  get alpha() {
    return this.channels[this.alphaIndex];
  }
  set alpha(value: number) {
    this.channels[this.alphaIndex] = value;
  }

  constructor(channels: number[] = [], ranges: number[][] = [], model = 'Base', alphaIndex = 0) {
    this.channels = [...channels];
    this.ranges = [...ranges];

    this.ranges.map((o, i, l) => {
      if (this.channels[i] === undefined) {
        this.channels[i] = 0;
      }
    });

    this.alphaIndex = alphaIndex;
    this.model = model;
  }

}
