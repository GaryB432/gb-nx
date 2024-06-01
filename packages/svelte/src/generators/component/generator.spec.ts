import type { Tree } from '@nx/devkit';
import { addProjectConfiguration } from '@nx/devkit';
import { createTreeWithEmptyWorkspace } from '@nx/devkit/testing';
import { createSvelteKitApp } from '../../utils/svelte';
import componentGenerator from './generator';

describe('component', () => {
  let appTree: Tree;
  const projectName = 'my-app';

  beforeEach(() => {
    appTree = createTreeWithEmptyWorkspace({ layout: 'apps-libs' });
    createSvelteKitApp(appTree, '0', {
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

    expect(appTree.read('apps/my-app/src/lib/Hello.svelte', 'utf-8')).toContain(
      'export let subject'
    );
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
});
