import { Base } from './base';

export class BaseFactory {

  public static create(
    values: any,
    clampValues: boolean,
    ranges: number[][],
    model: string,
    alphaIndex = 3,
    clampFunction: any = null,
  ) {
    const result = new Base(values, ranges, model, alphaIndex, clampFunction);
    if (clampValues) {
      result.clamp();
    }
    return result;
  }

  /**
   * Map a name to the properties that define a color model
   * @param name Color model name
   * @param ranges Ranges that will limit this model's values
   * @param alphaIndex Which one of the channels as alpha
   * @param clampFunction Function that will keep channels values inside range
   */
  public static setModel(name: string, ranges: number[][], alphaIndex: number, clampFunction?: (n: any) => any) {
    BaseFactory.models.set(name, new Base([], ranges, name, alphaIndex, clampFunction));
  }

  /**
   * Remove this entry from the map of color models
   * @param name Model's name
   */
  public static deleteModel(name: string):boolean {
    return BaseFactory.models.delete(name);
  }

  /**
   * Check if there's an entry on map of color models under this name
   * @param name Model's name
   */
  public static hasModel(name: string):boolean {
    return BaseFactory.models.has(name);
  }

  /**
   * Return the color model indexed under this name
   * @param name Model's name
   */
  public static getModel(name: string):Base | undefined {
    return BaseFactory.models.get(name);
  }


  /**
   * Creates a Base using the model defined in model parameter
   * @param values channel values
   * @param model channel values
   * @param clampValues if values should be clamped, default is true
   */
  public static createGeneric(values?: number[], model = 'rgb', clampValues = true): Base {
    switch (model) {
      case 'cmyk':
        return this.createCMYK(values != null ? values : [0, 0, 0, 0, 1], clampValues);
      case 'hsl':
        return this.createHSL(values != null ? values : [0, 0, 0, 1], clampValues);
      case 'lab':
        return this.createLAB(values != null ? values : [0, 0, 0, 1], clampValues);
      case 'rgb':
        return this.createRGB(values != null ? values : [0, 0, 0, 1], clampValues);
      case 'xyz':
        return this.createXYZ(values != null ? values : [0, 0, 0, 1], clampValues);
      default:
        if(BaseFactory.models.has(model)){
          const b = BaseFactory.models.get(model);
          if( b != null){
            return BaseFactory.create(values, clampValues, b.ranges, b.model, b.alphaIndex, b.clampFunction);
          }
        }
        throw new Error('BaseFactory couldn\'t recognise model: '+model);
  }

    throw new Error('BaseFactory couldn\'t recognise creation parameters');
  }


  /**
   * Creates a Base using the RGB model
   * @param values channel values
   * @param clampValues if values should be clamped, default is true
   */
  public static createRGB(values = [0, 0, 0, 1], clampValues = true): Base {
    const result = new Base(values, [[0, 255], [0, 255], [0, 255], [0, 1]], 'rgb', 3);
    if (clampValues) {
      result.clamp();
    }
    return result;
  }

  /**
   * Creates a Base using the HSL model
   * @param values channel values
   * @param clampValues if values should be clamped, default is true
   */
  public static createHSL(values = [0, 0, 0, 1], clampValues = true): Base {

    const result = new Base(values, [[0, 360], [0, 100], [0, 100], [0, 1]], 'hsl', 3, (scope: Base) => {

      scope.channels[0] = ((scope.channels[0] % 360) + 360) % 360;

      for (let i = 1; i < scope.channels.length; i++) {
        scope.channels[i] =
          scope.ranges[i][0] > scope.channels[i]
            ? scope.ranges[i][0]
            : scope.ranges[i][1] < scope.channels[i]
              ? scope.ranges[i][1]
              : scope.channels[i];
      }

    });
    if (clampValues) {
      result.clamp();
    }
    return result;
  }

  /**
   * Creates a Base using the CMYK model
   * @param values channel values
   * @param clampValues if values should be clamped, default is true
   */
  public static createCMYK(values = [0, 0, 0, 0, 1], clampValues = true): Base {
    const result = new Base(values, [[0, 100], [0, 100], [0, 100], [0, 100], [0, 1]], 'cmyk', 4);
    if (clampValues) {
      result.clamp();
    }
    return result;
  }

  /**
   * Creates a Base using the LAB model
   * @param values channel values
   * @param clampValues if values should be clamped, default is true
   */
  public static createLAB(values = [0, 0, 0, 1], clampValues = true): Base {
    const result = new Base(values, [[0, 100], [-128, 128], [-128, 128], [0, 1]], 'lab', 3);
    if (clampValues) {
      result.clamp();
    }
    return result;
  }

  /**
   * Creates a Base using the XYZ model
   * @param values channel values
   * @param clampValues if values should be clamped, default is true
   */
  public static createXYZ(values = [0, 0, 0, 1], clampValues = true): Base {
    const result = new Base(values, [[0, 100], [0, 100], [0, 100], [0, 1]], 'xyz', 3);
    if (clampValues) {
      result.clamp();
    }
    return result;
  }

  private static models: Map<string, Base> = new Map<string, Base>();
}
