import { type ProjectConfiguration } from '@nrwl/devkit';
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
    const { directory, name, sourceRoot } = optionsForSchematic(
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
    );
    expect(sourceRoot).toEqual('');
    expect(directory).toEqual('asdf/deep');
    expect(name).toEqual('auto/resort');
  });
});

describe('simple', () => {
  test('with directory', () => {
    const { directory, name, sourceRoot } = optionsForSchematic(project, {
      ...parms,
      directory: 'asdf/deep',
      name: 'auto/resort',
    });
    expect(sourceRoot).toEqual(project.sourceRoot);
    expect(directory).toEqual('asdf/deep');
    expect(name).toEqual('auto/resort');
  });
  test('no directory', () => {
    const { directory, name, sourceRoot } = optionsForSchematic(project, {
      ...parms,
      name: 'simple',
    });
    expect(sourceRoot).toEqual(project.sourceRoot);
    expect(directory).toBeUndefined();
    expect(name).toEqual('simple');
  });
});
describe('complex', () => {
  test('with directory', () => {
    const { directory, name, sourceRoot } = optionsForSchematic(project, {
      ...parms,
      directory: 'in/here',
      name: 'anything/but/simple',
    });
    expect(sourceRoot).toEqual(project.sourceRoot);
    expect(directory).toEqual('in/here');
    expect(name).toEqual('anything/but/simple');
  });
  test('no directory', () => {
    const { directory, name, sourceRoot } = optionsForSchematic(project, {
      ...parms,
      name: 'anything/but/simple',
    });
    expect(sourceRoot).toEqual(project.sourceRoot);
    expect(directory).toBeUndefined();
    expect(name).toEqual('anything/but/simple');
  });
});
