import { createTreeWithEmptyWorkspace } from '@nrwl/devkit/testing';
import {
  Tree,
  readProjectConfiguration,
  addProjectConfiguration,
  readJson,
} from '@nrwl/devkit';

import generator from './generator';
import { InitGeneratorSchema } from './schema';

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
