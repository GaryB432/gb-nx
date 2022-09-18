import { stringInsert } from './strings';

describe('Strings', () => {
  test('stringInsert without comma', () => {
    expect(stringInsert('ABCGHI', 3, false, 'DEF')).toEqual('ABCDEFGHI');
  });

  test('stringInsert', () => {
    expect(stringInsert('ABCGHI', 3, true, 'DEF')).toEqual('ABC,DEFGHI');
  });
});
