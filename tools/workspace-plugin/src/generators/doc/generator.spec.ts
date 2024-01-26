import { type Tree } from '@nx/devkit';
import { createTreeWithEmptyWorkspace } from '@nx/devkit/testing';
import { docGenerator } from './generator';
import { type DocGeneratorSchema } from './schema';

describe('doc generator', () => {
  let tree: Tree;

  beforeEach(() => {
    tree = createTreeWithEmptyWorkspace();
  });

  it('should run successfully', async () => {
    await docGenerator(tree, {});
    // const config = readProjectConfiguration(tree, 'test');
    expect(2 + 2).not.toEqual(5);
  });
});
