import type { Tree } from '@nx/devkit';
import { createTreeWithEmptyWorkspace } from '@nx/devkit/testing';
import type { Schema as InitGeneratorSchema } from '@nx/node/src/generators/init/schema';
import { readJson } from 'nx/src/generators/utils/json';
import initGenerator from './init';

describe('init generator', () => {
  let appTree: Tree;
  const options: InitGeneratorSchema = {};

  beforeEach(() => {
    appTree = createTreeWithEmptyWorkspace({ layout: 'apps-libs' });
  });

  it('should run successfully', async () => {
    await initGenerator(appTree, options);
    const pj = readJson(appTree, 'package.json');
    expect(pj.devDependencies!['eslint-plugin-gb']).toBeDefined();
  });
});
