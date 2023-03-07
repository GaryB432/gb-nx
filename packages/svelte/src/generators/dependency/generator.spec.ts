import { readNxJson, type Tree } from '@nrwl/devkit';
import { createTreeWithEmptyWorkspace } from '@nrwl/devkit/testing';
import { applicationGenerator, libraryGenerator } from '@nrwl/node';
import { createSvelteKitApp } from '../../utils/svelte';
import generator from './generator';
import type { Schema as DependencyGeneratorSchema } from './schema';

describe('dependency generator', () => {
  let appTree: Tree;
  const options: DependencyGeneratorSchema = {
    project: 'test',
    dependency: 'dep',
  };

  beforeEach(async () => {
    appTree = createTreeWithEmptyWorkspace({ layout: 'apps-libs' });
    void (await applicationGenerator(appTree, { name: 'test' }));
    void (await libraryGenerator(appTree, { name: 'dep', compiler: 'swc' }));
    createSvelteKitApp(appTree, '0', {
      name: 'test',
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
    const ws = readNxJson(appTree);
    expect(ws?.npmScope).toEqual('proj');
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
  };

  beforeEach(async () => {
    appTree = createTreeWithEmptyWorkspace({ layout: 'apps-libs' });
    void (await applicationGenerator(appTree, { name: 'test' }));
    void (await libraryGenerator(appTree, { name: 'dep', compiler: 'swc' }));
    createSvelteKitApp(appTree, '0', { name: 'test', directory: 'apps' });
  });

  it('should add dep', async () => {
    await generator(appTree, options);
    const content = appTree.read('apps/test/svelte.config.js');
    expect(content?.toString()).toContain("'@tbd/dep': '../../libs/dep/src'");
  });
});
