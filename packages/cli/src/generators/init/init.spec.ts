import type { Tree } from '@nx/devkit';
import { readRootPackageJson } from '@nx/devkit';
import { createTreeWithEmptyWorkspace } from '@nx/devkit/testing';
import type { Schema as InitGeneratorSchema } from '@nx/node/src/generators/init/schema';
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
