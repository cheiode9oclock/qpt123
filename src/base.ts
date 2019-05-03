export class Base {
  public model = 'Base';
  public alphaIndex = 0;
  public ranges: number[][] = [];
  public channels: number[] = [];
  public clampFunction: any;

  get alpha() {
    return this.channels[this.alphaIndex];
  }
  set alpha(value: number) {
    this.channels[this.alphaIndex] = value;
  }

  constructor(
    channels: number[] = [],
    ranges: number[][] = [],
    model = 'Base',
    alphaIndex = 0,
    clampFunction: any = null,
  ) {
    this.channels = [...channels];
    this.ranges = [...ranges];

    this.ranges.map((o, i, l) => {
      if (this.channels[i] === undefined) {
        this.channels[i] = 0;
      }
    });

    this.alphaIndex = alphaIndex;
    this.model = model;

    if (clampFunction == null) {
      this.clampFunction = (scope: Base) => {
        scope.channels.map((o, i, l) => {
          scope.channels[i] =
            scope.ranges[i][0] > scope.channels[i]
              ? scope.ranges[i][0]
              : scope.ranges[i][1] < scope.channels[i]
              ? scope.ranges[i][1]
              : scope.channels[i];
        });
      };
    } else {
      this.clampFunction = clampFunction;
    }
  }

  /**
   * Apply clamp function keep channels' values inside ranges
   */
  public clamp() {
    this.clampFunction(this);
  }
}
