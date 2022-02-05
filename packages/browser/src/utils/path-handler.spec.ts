import { translateToOutputPath } from './path-handler';
describe('path', () => {
  it('works', () => {
    expect(
      translateToOutputPath(
        'p/q/r/s/packages/build-me/src/a/b/c/d/e.ts',
        'packages/build-me/src',
        'dist/packages/build-me/extension-cabinet'
      )
    ).toEqual({
      base: 'e.tbd',
      dir: 'p/q/r/s/dist/packages/build-me/extension-cabinet/a/b/c/d',
      ext: '.tbd',
      name: 'e',
      root: '',
    });
  });
});
