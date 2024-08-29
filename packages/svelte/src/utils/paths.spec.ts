import {
  commonParentFolder,
  dependencySourceRoot,
  makeAliasName,
  nodeResolutionPaths,
} from './paths';

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

describe('nodeResolutionPaths', () => {
  it('works', () => {
    expect(nodeResolutionPaths('apps/ab/cd/df/gh/way-in-here')).toEqual([
      'apps/ab/cd/df/gh/way-in-here',
      'apps/ab/cd/df/gh',
      'apps/ab/cd/df',
      'apps/ab/cd',
      'apps/ab',
      'apps',
    ]);
  });
});

describe('commonParentFolder', () => {
  it('works', () => {
    expect(
      commonParentFolder({
        a: 'src/abc/def',
        b: 'src/abc/ghi',
        c: 'src/abc/fun/long',
        d: 'src/abc/fun/more/names/here',
        e: 'src/abc',
      })
    ).toEqual('src/abc');
  });
});

describe('dependencySourceRoot', () => {
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
