// import { expect } from 'chai';
// import 'mocha';

import { Color } from '../src/color';
import { HSL } from '../src/models/hsl';
import { RGB } from '../src/models/rgb';

// describe('control group', () => {

//   it('if not even this one is passing something else is wrong...', () => {
//     expect(true).to.equal(true);

//   });
// });


// import { Greeter } from '../index';

test('My Greeter', () => {
  // expect(Greeter('Carl')).toBe('Hello Carl');
  expect(true).toBe(true);
});


test('RGB.model', () => {

  const rgb = new RGB([0, 0, 0, 1]);
  const result = RGB.MODEL;
  expect(result).toBe(rgb.model);
});