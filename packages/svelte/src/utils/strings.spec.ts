import { add, greet, meaning, stringInsert } from './strings';

describe('Strings', () => {
  test('adds', () => {
    expect(add(2, 3)).toEqual(5);
  });
  test('greets', () => {
    expect(greet('world')).toEqual('strings says: hello to world');
  });

  test('meaning', () => {
    expect(meaning.life).toEqual(42);
  });

  test('stringInsert without comma', () => {
    expect(stringInsert('ABCGHI', 3, false, 'DEF')).toEqual('ABCDEFGHI');
  });

  test('stringInsert', () => {
    expect(stringInsert('ABCGHI', 3, true, 'DEF')).toEqual('ABC,DEFGHI');
  });
});
