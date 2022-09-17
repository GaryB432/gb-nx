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
  const options: ComponentGeneratorSchema = {
    name: 'banana',
    project: 'test',
    directory: 'abc/def',
  };

  beforeEach(() => {
    appTree = createTreeWithEmptyWorkspace();
    addProjectConfiguration(appTree, 'test', {
      root: 'N/A',
      sourceRoot: 'test/root/src',
    });
  });

  it('should run successfully', async () => {
    await generator(appTree, options);
    const config = readProjectConfiguration(appTree, 'test');
    expect(config).toBeDefined();
  });

  it('should create files', async () => {
    await generator(appTree, options);
    // expect(appTree.listChanges().map((j) => j.path)).toEqual([]);
    expect(appTree.exists('/test/root/src/abc/def/banana.ts')).toBeTruthy();
  });
});
