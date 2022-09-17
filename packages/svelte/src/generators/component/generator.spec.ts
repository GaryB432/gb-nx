import type { Tree } from '@nrwl/devkit';
import {
  addProjectConfiguration,
  readProjectConfiguration,
} from '@nrwl/devkit';
import { createTreeWithEmptyWorkspace } from '@nrwl/devkit/testing';
import generator from './generator';
import type { Schema as ComponentGeneratorSchema } from './schema';

describe('component generator', () => {
  let appTree: Tree;
  const options: ComponentGeneratorSchema = { name: 'tbd', project: 'test' };

  beforeEach(() => {
    appTree = createTreeWithEmptyWorkspace();
    addProjectConfiguration(appTree, 'test', { root: 'hmmm' });
  });

  it('should run successfully', async () => {
    await generator(appTree, options);
    const config = readProjectConfiguration(appTree, 'test');
    expect(config).toBeDefined();
  });
});
