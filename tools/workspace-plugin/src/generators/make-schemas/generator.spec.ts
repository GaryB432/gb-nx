import { type Tree } from '@nx/devkit';
import { createTreeWithEmptyWorkspace } from '@nx/devkit/testing';
import generator from './generator';
import { type Schema as MakeSchemasGeneratorSchema } from './schema';

describe('make-schemas generator', () => {
  let appTree: Tree;
  const options: MakeSchemasGeneratorSchema = { name: 'test' };

  beforeEach(() => {
    appTree = createTreeWithEmptyWorkspace({ layout: 'apps-libs' });
  });

  it('should run successfully', async () => {
    await generator(appTree, options);

    expect(appTree.exists('nx.json')).toBeTruthy();
  });
});
