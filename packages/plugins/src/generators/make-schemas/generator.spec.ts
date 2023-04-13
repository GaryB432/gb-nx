import { type Tree } from '@nrwl/devkit';
import { createTreeWithEmptyWorkspace } from '@nrwl/devkit/testing';
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
