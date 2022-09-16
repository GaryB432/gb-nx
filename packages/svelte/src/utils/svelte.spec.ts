import { readProjectConfiguration, Tree } from '@nrwl/devkit';
import { createTreeWithEmptyWorkspace } from '@nrwl/devkit/testing';
import { applicationGenerator, libraryGenerator } from '@nrwl/node';
import { createSvelteKitApp, getSvelteConfig, isSvelte } from './svelte';

describe('Svelte', () => {
  let appTree: Tree;

  beforeEach(async () => {
    appTree = createTreeWithEmptyWorkspace();
    void (await applicationGenerator(appTree, { name: 'test' }));
    void (await libraryGenerator(appTree, { name: 'dep', compiler: 'swc' }));
    createSvelteKitApp(appTree, '0', 'apps/test');
  });

  it('should run successfully', async () => {
    const config = readProjectConfiguration(appTree, 'test');
    expect(isSvelte(appTree, config)).toBeTruthy();
  });

  it('getSvelteConfig', async () => {
    const config = readProjectConfiguration(appTree, 'test');
    expect(getSvelteConfig(appTree, config)).toContain(
      `/** @type {import('@sveltejs/kit').Config} */`
    );
  });
});
