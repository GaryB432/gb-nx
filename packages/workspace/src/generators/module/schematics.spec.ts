import { type ProjectConfiguration } from '@nx/devkit';
import { type Schema } from './schema';
import { optionsForSchematic } from './schematics';

const project: ProjectConfiguration = {
  name: 'test-proj',
  sourceRoot: 'apps/test-proj/src',
  projectType: 'application',
  root: '',
};
const parms: Schema = {
  directory: undefined,
  kind: 'values',
  name: 'tbd',
  project: 'unused',
  unitTestRunner: 'vitest',
};

describe('flat project sourceRoot', () => {
  test('sourceRoot dot', () => {
    expect(
      optionsForSchematic(
        {
          name: 'dot-sourceroot',
          sourceRoot: '.',
          projectType: 'application',
          root: '',
        },
        {
          ...parms,
          directory: 'asdf/deep',
          name: 'auto/resort',
        }
      )
    ).toEqual({
      directory: 'asdf/deep',
      kind: 'values',
      name: 'auto/resort',
      inSourceTests: true,
      sourceRoot: '',
      unitTestRunner: 'vitest',
    });
  });
});

describe('simple', () => {
  test('with directory', () => {
    expect(
      optionsForSchematic(project, {
        ...parms,
        directory: 'asdf/deep',
        name: 'auto/resort',
      })
    ).toEqual({
      directory: 'asdf/deep',
      kind: 'values',
      name: 'auto/resort',
      inSourceTests: true,
      sourceRoot: 'apps/test-proj/src',
      unitTestRunner: 'vitest',
    });
  });
  test('no directory', () => {
    expect(
      optionsForSchematic(project, {
        ...parms,
        name: 'simple',
      })
    ).toEqual({
      directory: undefined,
      kind: 'values',
      name: 'simple',
      inSourceTests: true,
      sourceRoot: 'apps/test-proj/src',
      unitTestRunner: 'vitest',
    });
  });
});
describe('complex', () => {
  test('with directory', () => {
    expect(
      optionsForSchematic(project, {
        ...parms,
        directory: 'in/here',
        name: 'anything/but/simple',
      })
    ).toEqual({
      directory: 'in/here',
      kind: 'values',
      name: 'anything/but/simple',
      inSourceTests: true,
      sourceRoot: 'apps/test-proj/src',
      unitTestRunner: 'vitest',
    });
  });
  test('no directory', () => {
    expect(
      optionsForSchematic(project, {
        ...parms,
        name: 'anything/but/simple',
      })
    ).toEqual({
      directory: undefined,
      kind: 'values',
      name: 'anything/but/simple',
      inSourceTests: true,
      // project: 'unused',
      sourceRoot: 'apps/test-proj/src',
      unitTestRunner: 'vitest',
    });
  });
});
