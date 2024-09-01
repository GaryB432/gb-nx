import { createTreeWithEmptyWorkspace } from '@nx/devkit/testing';
import { readNxJson, Tree, updateNxJson } from '@nx/devkit';

import update from './change-shared-to-universal';

describe('change-shared-to-universal migration', () => {
  let tree: Tree;

  beforeEach(() => {
    tree = createTreeWithEmptyWorkspace({ layout: 'apps-libs' });
  });

  it('replaces shared load with universal', async () => {
    updateNxJson(tree, {
      affected: { defaultBase: 'main' },
      generators: {
        '@gb-nx/svelte:route': {
          project: 'web',
          directory: 'components',
          style: 'scss',
          language: 'ts',
          load: 'shared',
        },
        '@nx/web:application': {
          style: 'scss',
          linter: 'eslint',
          unitTestRunner: 'jest',
          e2eTestRunner: 'none',
        },
      },
      targetDefaults: { build: { cache: true }, lint: { cache: true } },
    });
    update(tree);
    const config = readNxJson(tree);
    expect(config!.affected).toEqual({ defaultBase: 'main' });
    expect(config!.generators!['@gb-nx/svelte:route']['load']).toEqual(
      'universal'
    );
  });

  it('does not wreck nxjson', async () => {
    updateNxJson(tree, {
      generators: {
        '@gb-nx/svelte:route': {
          load: 'server',
        },
      },
      targetDefaults: { build: { cache: true }, lint: { cache: true } },
    });
    update(tree);
    const config = readNxJson(tree);
    expect(config!.affected).toBeUndefined();
    expect(config!.generators!['@gb-nx/svelte:route']['load']).toEqual(
      'server'
    );
  });
});
