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
    createSvelteKitApp(appTree, '0', { directory: 'apps', name: projectName });
    addProjectConfiguration(appTree, projectName, { root: 'apps/my-app' });
  });

  it('should generate component in components directory', async () => {
    await componentGenerator(appTree, {
      name: 'hello',
      project: projectName,
      directory: 'components',
    });

    expect(appTree.read('apps/my-app/src/lib/components/Hello.svelte', 'utf-8'))
      .toMatchInlineSnapshot(`
      "
      <script>
        export let subject = 'Hello component';
      </script>

      <div class=\\"container\\">
        {subject} works
      </div>

      <style>
        .container {
          border: thin solid silver;
        }
      </style>

      "
    `);
  });

  it('should generate component in lib directory', async () => {
    await componentGenerator(appTree, {
      name: 'hello',
      project: projectName,
    });

    expect(appTree.read('apps/my-app/src/lib/Hello.svelte', 'utf-8'))
      .toMatchInlineSnapshot(`
      "
      <script>
        export let subject = 'Hello component';
      </script>

      <div class=\\"container\\">
        {subject} works
      </div>

      <style>
        .container {
          border: thin solid silver;
        }
      </style>

      "
    `);
  });

  it('should generate component with scss', async () => {
    await componentGenerator(appTree, {
      name: 'hello',
      project: projectName,
      style: 'scss',
    });

    expect(appTree.read('apps/my-app/src/lib/Hello.svelte', 'utf-8'))
      .toMatchInlineSnapshot(`
      "
      <script>
        export let subject = 'Hello component';
      </script>

      <div class=\\"container\\">
        {subject} works
      </div>

      <style lang=\\"scss\\">
        .container {
          border: thin solid silver;
        }
      </style>

      "
    `);
  });
});
