import { Color } from './color';
import { Relation } from './relation';

/**
 * Ccollection of groups of colors indexed by names
 */
export class Culture {
  /**
   * this module version
   */

  get items() {
    return this.mItems;
  }
  public name = '';
  public id = '';

  /**
   * Ccollection of groups of colors indexed by names
   */

  protected mItems = new Array<Relation>();

  /**
   * Create a collection of groups of colors indexed by names
   */
  constructor() {
    // this._colors = new Map<string, Group>();
    // this._cache = new Array<[string, Group]>();

  }

  public addColor(color: Color): boolean {

    if (color !== undefined && color !== null) {
      // if (color instanceof Culture) {
      // if (this._items.indexOf(color) === -1) {
      this.mItems.push(new Relation(color));
      return true;
      // }
      // }
      //  else {
      //   if (this._colors.indexOf(color) === -1) {
      //     this._colors.push(color);
      //     return true;
      //   }
      // }
    }
    return false;
  }

  public addRelation(relation: Relation) {

    const reference = null;

    if (relation !== undefined) {
      this.mItems.push(relation);

      return this.mItems.length - 1;
    }

    throw new Error('Culture can\'t add a null relation');

  }

  // public getIndex(index: number) {
  //   const relation = this._items[index] as Relation;
  //   return relation.result(this, relation.fromIndex, this._items);
  // }
  // /**
  //  * Make a cache so frameworks like Angular do not keep updating the view because values are stored in a map...
  //  */
  // protected _cache: [string, Group][];



  // /**
  //  * Return colors in this group
  //  */
  // get colors(): [string, Group][] {
  //   return this._cache;
  // }

  // /**
  //  * Update array cache
  //  */
  // updateCache() {
  //   this._cache = Array.from(this._colors);
  // }


  // /**
  //  * Link a group of colors to a name, so that them can be retrieved by it latter
  //  * @param name Name by which this group of colors will be recognized
  //  * @param shape Group of colors
  //  */
  // set(name: string, shape: Group) {
  //   this._colors.set(name, shape.clone());
  //   this.updateCache();
  // }

  // /**
  // * Add color to an index
  //  * @param name Index where the color will be added
  //  * @param color Color to be added
  //  */
  // add(name: string, color: Color): boolean {
  //   if (this._colors.has(name)) {
  //     let copy = this._colors.get(name);
  //     if (copy != undefined) {
  //       copy.add(color);
  //       this._colors.set(name, copy);
  //       this.updateCache();
  //       return true;
  //     }
  //   }
  //   return false;
  // }

  // /**
  //  * Remove shape named after this
  //  * @param name Name of the shape
  //  */
  // remove(name: string): Group | undefined {
  //   if (this._colors.has(name)) {
  //     const result = this._colors.get(name);
  //     this._colors.delete(name);
  //     this.updateCache();

  //     return result;
  //   }
  //   return undefined;
  // }

  // /**
  //  * Remove every instance of this color in the shape named after name
  //  * @param name Name of the shape
  //  * @param color Color to be removed
  //  */
  // removeByColor(name: string, color: Color): boolean {

  //   if (this._colors.has(name)) {
  //     let copy = this._colors.get(name);
  //     if (copy != undefined && copy.removeByColor(color)) {
  //       this._colors.set(name, copy);
  //       this.updateCache();

  //       return true;
  //     }
  //   }
  //   return false;

  // }

  // /**
  //  * Remove a color from a group based on its order
  //  * @param name Name of the group
  //  * @param index Order of the color in the group
  //  */
  // removeByIndex(name: string, index: number): boolean {

  //   if (this._colors.has(name)) {
  //     let copy = this._colors.get(name);
  //     if (copy != undefined && copy.removeByIndex(index)) {
  //       this._colors.set(name, copy);
  //       this.updateCache();

  //       return true;
  //     }
  //   }
  //   return false;
  // }

  // /**
  //  * Get a group of colors by its name
  //  * @param name Name of the group
  //  */
  // getByName(name: string): Group | undefined {
  //   const result = this._colors.get(name);
  //   if (result) {
  //     return result.clone();
  //   }
  //   return undefined;
  // }

  // /**
  //  * Get a random color in this culture
  //  */
  // randomMix(): Color | undefined {
  //   let populatedShapes = new Array<Group>();
  //   let totalColors = 0;

  //   //if a shape is present but has no colors do not count as a possible random pick
  //   this._colors.forEach((value) => { if (value.colors.length) { populatedShapes.push(value.clone()); totalColors+=value.colors.length; } });

  //   const keySize = populatedShapes.length;

  //   if (totalColors == 0) {
  //     return undefined;
  //   }

  //   let pickRandom = Math.floor(Math.random() * totalColors);

  //   for (let count = 0; count < keySize; count++) {
  //     const s = populatedShapes[count];
  //     if (pickRandom < s.colors.length) {

  //       return s.randomMix();

  //     }
  //     pickRandom -= s.colors.length;
  //   };

  //   return undefined;
  // }

  // /**
  // /* Pick a random color vertex of the path
  // */
  // randomColor(): Color | undefined {
  //   let populatedShapes = new Array<Group>();
  //   let totalColors = 0;

  //   //if a shape is present but has no colors do not count as a possible random pick
  //   this._colors.forEach((value) => { if (value.colors.length) { populatedShapes.push(value.clone()); totalColors+=value.colors.length; } });

  //   const keySize = populatedShapes.length;

  //   if (totalColors == 0) {
  //     return undefined;
  //   }

  //   let pickRandom = Math.floor(Math.random() * totalColors);

  //   for (let count = 0; count < keySize; count++) {
  //     const s = populatedShapes[count];
  //     if (pickRandom < s.colors.length) {

  //       return s.randomColor();

  //     }
  //     pickRandom -= s.colors.length;
  //   };

  //   return undefined;
  // }

  // /**
  //  * Check if this culture has this name as an index
  //  * @param  {string} name Search for this color
  //  * @returns boolean Returns true if name is present, false if not found
  //  */
  // has(name: string): boolean {
  //   return this._colors.has(name);
  // }

}
