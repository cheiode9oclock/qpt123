import { Compute } from '.';
import { Color } from './color';
import { Relation } from './relation';

/**
 * Ccollection of groups of colors indexed by names
 */
export class Culture {
  get items() {
    return this.m_items;
  }

  /**
   * Ccollection of groups of colors indexed by names
   */
  protected m_items = new Array<Relation>();


  /**
   * Add a color to this culture
   * @param color Color to be added
   */
  public addColor(color: Color): Relation {
    if (color !== undefined && color !== null) {
      const rel = new Relation(color);

      this.m_items.push(rel);

      return rel;
    }
    throw new Error('Culture cant add an undefined color');
  }

  /**
   * 
   * @param modifier A color or method that will modify
   * @param from 
   * @param list 
   */
  public addRelation(modifier: any = null, from?: Relation | undefined, list = null): Relation {
    const relation = new Relation(modifier, from, list);

    if (relation.from !== undefined) {
      relation.fromList = this.m_items;
    }

    this.m_items.push(relation);

    return relation;
  }

  // According to https://sighack.com/post/averaging-rgb-colors-the-right-way, https://www.youtube.com/watch?v=LKnqECcg6Gw
  /**
   * Average color of the items in this Culture
   */
  public get average(): Color {
    const colors = this.items.map(o => {
      return o.result.rgb();
    });
    return Compute.average(colors);
  }

  /**
   * Remove item from culture
   * @param name Item id
   */
  public removeById(id: string): Relation | undefined {
    if (id !== '') {
      const index = this.items.findIndex(o => o.id === id);
      if (index > -1) {
        return this.items.splice(index, 1)[0];
      }
    }
    return undefined;
  }

  public remove(relation: Relation): Relation | undefined {
    if (relation === undefined) { throw new Error('Culture cannot remove an undefined relation'); }
    return this.removeById(relation.id);
  }

  /**
   * Get an item by its id
   * @param id Item id
   */
  public getById(id: string): Relation | undefined {

    if (id !== '') {
      const index = this.items.findIndex(o => o.id === id);
      if (index > -1) {
        return this.items[index];
      }
    }
    return undefined;
  }

  /**
   * Get an item by its index
   * @param id Item index
   */
  public getAt(index: number): Relation | undefined {
    return this.items[index];
  }

  /**
   * Get an item by its index and return the resulting color
   * @param id Item index
   */
  public getColorAt(index: number): Color | undefined {
    try {
      this.items[index].result;
    } catch (e) {
      throw new Error("Culture getColorAt " + e);
    }
    return undefined;
  }

  /**
   * Pick a random color vertex of the path
   */
  public randomColor(): Color | undefined {
    if (this.items === undefined || this.items.length === 0) {
      throw new Error('Cannot pick random color of an empty culture');
    }

    const index = Math.floor(Math.random() * this.items.length);

    return this.items[index].result;
  }

  /**
   * Get a Color from mixing two random colors in this culture
   */
  public randomMix(): Color {
    if (this.items === undefined || this.items.length === 0) {
      throw new Error('Cannot pick random color mix of an empty culture');
    }
    const pool = [...this.items];
    let size = pool.length;
    const firstColor = pool.splice(Math.floor(Math.random() * size))[0].result;
    if (size === 1) {
      return firstColor;
    }
    size = pool.length;
    const secondColor = pool.splice(Math.floor(Math.random() * size))[0].result;

    return secondColor.mix(firstColor, Math.random());
  }
}
