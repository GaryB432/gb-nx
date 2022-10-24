import type { Tree } from '@nrwl/devkit';
// import { readProjectConfiguration } from '@nrwl/devkit';
import { createTreeWithEmptyWorkspace } from '@nrwl/devkit/testing';
import { libraryGenerator } from '@nrwl/node';
import { createSvelteKitApp } from './svelte';

describe('Svelte', () => {
  let appTree: Tree;

  beforeEach(async () => {
    appTree = createTreeWithEmptyWorkspace();
    // void (await applicationGenerator(appTree, { name: 'testx' }));
    void (await libraryGenerator(appTree, { name: 'dep', compiler: 'swc' }));
    createSvelteKitApp(appTree, '0', {
      name: 'test',
      directory: 'apps',
    });
  });

  it('should run successfully', async () => {
    const pkg = JSON.parse(appTree.read('apps/test/package.json')!.toString());
    expect(pkg.name).toEqual('test');
    expect(pkg.nx.ignore).toBeFalsy();
    // const config = readProjectConfiguration(appTree, 'test');
    // expect(isSvelte(appTree, config)).toBeTruthy();
  });

  it('getSvelteConfig', async () => {
    expect(appTree.exists('apps/test/svelte.config.js')).toBeTruthy();
    // const config = readProjectConfiguration(appTree, 'test');
    // expect(getSvelteConfig(appTree, config)).toContain(
    //   `/** @type {import('@sveltejs/kit').Config} */`
    // );
  });
});
