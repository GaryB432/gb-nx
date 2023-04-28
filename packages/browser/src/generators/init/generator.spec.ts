import type { Tree } from '@nx/devkit';
import { readJson } from '@nx/devkit';
import { createTreeWithEmptyWorkspace } from '@nx/devkit/testing';

import generator from './generator';
import type { Schema as InitGeneratorSchema } from './schema';

xdescribe('init generator', () => {
  let appTree: Tree;
  const options: InitGeneratorSchema = {};

  beforeEach(() => {
    appTree = createTreeWithEmptyWorkspace({ layout: 'apps-libs' });
  });

  it('should run successfully', async () => {
    await generator(appTree, options);
    const pj = readJson(appTree, 'package.json');
    // const config = readProjectConfiguration(appTree, 'test');
    expect(pj).toBeDefined();
  });
});
