import { dependencySourceRoot, makeAliasName } from './paths';

describe('makeAliasName', () => {
  test('a', () => {
    expect(makeAliasName('tester', 'fun')).toEqual('@fun/tester');
  });
  test('b', () => {
    expect(makeAliasName('tester', '')).toEqual('tester');
  });
  test('c', () => {
    expect(makeAliasName('tester', undefined)).toEqual('tester');
  });
  test('d', () => {
    expect(makeAliasName('', '')).toEqual('');
  });
  test('e', () => {
    expect(makeAliasName('', undefined)).toEqual('');
  });
  test('f', () => {
    expect(makeAliasName('', 'fun')).toEqual('');
  });
  test('g', () => {
    expect(makeAliasName('', '')).toEqual('');
  });
  test('h', () => {
    expect(makeAliasName('', undefined)).toEqual('');
  });
  test('i', () => {
    expect(makeAliasName('', 'fun')).toEqual('');
  });
});

describe('', () => {
  expect(
    dependencySourceRoot(
      { root: 'apps/ab/cd/df/gh/way-in-here' },
      {
        root: 'libs/now/is/the/time/for/all/good/men/omg/other-things',
        sourceRoot:
          'libs/now/is/the/time/for/all/good/men/omg/other-things/src',
      }
    )
  ).toEqual(
    '../../../../../../libs/now/is/the/time/for/all/good/men/omg/other-things/src'
  );
});
