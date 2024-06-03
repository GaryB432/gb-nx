import type { Tree } from '@nx/devkit';
import { addProjectConfiguration } from '@nx/devkit';
import { createTreeWithEmptyWorkspace } from '@nx/devkit/testing';
import { createSvelteKitApp } from '../../utils/svelte';
import componentGenerator from './generator';

import '../../utils/testing/matchers';

describe('component svelte 4', () => {
  let appTree: Tree;
  const projectName = 'my-app';

  beforeEach(() => {
    appTree = createTreeWithEmptyWorkspace({ layout: 'apps-libs' });
    createSvelteKitApp(appTree, '4.0.0', {
      directory: 'apps',
      name: projectName,
      skipFormat: true,
    });
    addProjectConfiguration(appTree, projectName, { root: 'apps/my-app' });
  });

  it('should generate component in components directory', async () => {
    await componentGenerator(appTree, {
      name: 'hello',
      project: projectName,
      directory: 'components',
      skipFormat: true,
    });

    expect(
      appTree.read('apps/my-app/src/lib/components/Hello.svelte', 'utf-8')
    ).toMatchSnapshot();
  });

  it('should generate component in lib directory by default', async () => {
    await componentGenerator(appTree, {
      name: 'hello',
      project: projectName,
      skipFormat: true,
    });

    const helloSvelte = appTree.read(
      'apps/my-app/src/lib/Hello.svelte',
      'utf-8'
    );
    expect(helloSvelte).not.toUseRunes();
    expect(helloSvelte).toContain('export let subject');
  });

  it('should generate component with scss', async () => {
    await componentGenerator(appTree, {
      name: 'hello',
      project: projectName,
      style: 'scss',
      skipFormat: true,
    });

    expect(
      appTree.read('apps/my-app/src/lib/Hello.svelte', 'utf-8')
    ).toMatchSnapshot();
  });

  it('should not generate component with runes', async () => {
    expect(async () => {
      await componentGenerator(appTree, {
        name: 'hello',
        project: projectName,
        runes: true,
        skipFormat: true,
      });
    }).rejects.toThrow(
      "runes feature requires svelte >= 5 (currently '4.0.0')"
    );
  });
});

describe('component svelte 5', () => {
  let appTree: Tree;
  const projectName = 'my-app-5';

  beforeEach(() => {
    appTree = createTreeWithEmptyWorkspace({ layout: 'apps-libs' });
    createSvelteKitApp(appTree, '5.0.0', {
      directory: 'apps',
      name: projectName,
      skipFormat: true,
    });
    addProjectConfiguration(appTree, projectName, { root: 'apps/my-app-5' });
  });

  it('should generate component with runes', async () => {
    await componentGenerator(appTree, {
      name: 'hello',
      project: projectName,
      runes: true,
      skipFormat: true,
    });

    expect(
      appTree.read('apps/my-app-5/src/lib/Hello.svelte', 'utf-8')
    ).toUseRunes();
  });

  it('should default runes', async () => {
    await componentGenerator(appTree, {
      name: 'hello',
      project: projectName,
      runes: undefined,
      skipFormat: true,
    });

    expect(
      appTree.read('apps/my-app-5/src/lib/Hello.svelte', 'utf-8')
    ).toUseRunes();
  });
});
