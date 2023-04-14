import type { Tree } from '@nrwl/devkit';
import { readRootPackageJson } from '@nrwl/devkit';
import { createTreeWithEmptyWorkspace } from '@nrwl/devkit/testing';
import type { Schema as InitGeneratorSchema } from '@nrwl/node/src/generators/init/schema';
import initGenerator from './init';

describe('init generator', () => {
  let appTree: Tree;
  const options: InitGeneratorSchema = {};

  beforeEach(() => {
    appTree = createTreeWithEmptyWorkspace({ layout: 'apps-libs' });
  });

  it('should run successfully', async () => {
    await initGenerator(appTree, options);
    const pj = readRootPackageJson();
    expect(pj.devDependencies!['eslint-plugin-gb']).toBeDefined();
  });
});
