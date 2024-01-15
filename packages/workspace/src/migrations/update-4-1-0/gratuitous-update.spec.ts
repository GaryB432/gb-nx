import { type Tree } from '@nx/devkit';
import { createTreeWithEmptyWorkspace } from '@nx/devkit/testing';

import update from './gratuitous-update';

describe('gratuitous-update migration', () => {
  let tree: Tree;

  beforeEach(() => {
    tree = createTreeWithEmptyWorkspace({ layout: 'apps-libs' });
  });

  it('should run successfully', async () => {
    update(tree);
    expect(tree.exists('gb-nx.txt')).toBeTruthy();
  });
});
