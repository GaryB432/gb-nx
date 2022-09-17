import type { Tree } from '@nrwl/devkit';
import { readJson } from '@nrwl/devkit';
import { createTreeWithEmptyWorkspace } from '@nrwl/devkit/testing';

import generator from './generator';
import type { Schema as InitGeneratorSchema } from './schema';

xdescribe('init generator', () => {
  let appTree: Tree;
  const options: InitGeneratorSchema = {};

  beforeEach(() => {
    appTree = createTreeWithEmptyWorkspace();
  });

  it('should run successfully', async () => {
    await generator(appTree, options);
    const pj = readJson(appTree, 'package.json');
    // const config = readProjectConfiguration(appTree, 'test');
    expect(pj).toBeDefined();
  });
});
