import { addProjectConfiguration, type Tree } from '@nx/devkit';
import { createTreeWithEmptyWorkspace } from '@nx/devkit/testing';
import { createSvelteKitApp } from '../../utils/svelte';
import generator from './generator';
import type { Schema as DependencyGeneratorSchema } from './schema';

describe('dependency generator', () => {
  let appTree: Tree;
  const options: DependencyGeneratorSchema = {
    project: 'test',
    dependency: 'dep',
    scope: 'proj',
    skipFormat: true,
  };

  beforeEach(async () => {
    appTree = createTreeWithEmptyWorkspace({ layout: 'apps-libs' });
    addProjectConfiguration(appTree, 'test', {
      root: 'apps/test',
      projectType: 'application',
    });
    addProjectConfiguration(appTree, 'dep', {
      root: 'libs/dep',
      projectType: 'library',
    });
    createSvelteKitApp(appTree, '5.0.0', {
      name: 'test',
      skipFormat: true,
      directory: 'apps',
    });
  });

  it('should run successfully', async () => {
    await generator(appTree, options);

    const pbuff = appTree.read('apps/test/package.json');
    if (!pbuff) {
      throw new Error('no package json');
    }

    const pkg = JSON.parse(pbuff.toString()) as {
      nx: { implicitDependencies: string[] };
    };

    const config = pkg.nx;

    expect(config.implicitDependencies).toEqual(['dep']);
  });

  it('should add dep', async () => {
    await generator(appTree, options);
    const content = appTree.read('apps/test/svelte.config.js');
    expect(content?.toString()).toContain("'@proj/dep': '../../libs/dep/src'");
  });
});

describe('dependency generator with scope', () => {
  let appTree: Tree;
  const options: DependencyGeneratorSchema = {
    project: 'test',
    dependency: 'dep',
    scope: 'tbd',
    skipFormat: true,
  };

  beforeEach(async () => {
    appTree = createTreeWithEmptyWorkspace({ layout: 'apps-libs' });
    addProjectConfiguration(appTree, 'test', {
      root: 'apps/test',
      projectType: 'application',
    });
    addProjectConfiguration(appTree, 'dep', {
      root: 'libs/dep',
      projectType: 'library',
    });
    createSvelteKitApp(appTree, '5.0.0', {
      name: 'test',
      directory: 'apps',
      skipFormat: true,
    });
  });

  it('should add dep', async () => {
    await generator(appTree, options);
    const content = appTree.read('apps/test/svelte.config.js');
    expect(content?.toString()).toContain("'@tbd/dep': '../../libs/dep/src'");
  });
});
