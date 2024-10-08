import type { Tree } from '@nx/devkit';
import { createTreeWithEmptyWorkspace } from '@nx/devkit/testing';
import { libraryGenerator } from '@nx/node';
import {
  createSvelteKitApp,
  getSvelteFiles,
  getSveltePackageVersions,
  inferSourceDirectory,
  satisfiesRunes,
  supportsRunes,
} from './svelte';

describe('semver sanity check', () => {
  it('handles', () => {
    expect(satisfiesRunes('4.0.0')).toBeFalsy();
    expect(satisfiesRunes('5.0.0-alpha.1')).toBeTruthy();
    expect(satisfiesRunes('5.0.0')).toBeTruthy();
    expect(satisfiesRunes('6.0.0')).toBeTruthy();
  });
});

describe('Svelte', () => {
  let appTree: Tree;

  beforeEach(async () => {
    appTree = createTreeWithEmptyWorkspace({ layout: 'apps-libs' });
    void (await libraryGenerator(appTree, {
      name: 'dep',
      compiler: 'swc',
      directory: 'apps/dep',
      projectNameAndRootFormat: 'as-provided',
      skipFormat: true,
    }));
    createSvelteKitApp(appTree, '5.0.0', {
      name: 'test',
      directory: 'apps',
      skipFormat: true,
    });
  });

  it('gets SveltePackageVersions', () => {
    expect(
      getSveltePackageVersions(appTree, {
        root: 'apps/test',
      })
    ).toEqual([
      { name: '@sveltejs/kit', version: expect.anything() },
      // { name: '@sveltejs/vite-plugin-svelte', version: expect.anything() },
      { name: 'svelte', version: expect.anything() },
    ]);
  });

  it('getSvelteConfig', async () => {
    expect(appTree.exists('apps/test/svelte.config.js')).toBeTruthy();
    // const config = readProjectConfiguration(appTree, 'test');
    // expect(getSvelteConfig(appTree, config)).toContain(
    //   `/** @type {import('@sveltejs/kit').Config} */`
    // );
  });

  it('getSvelteFiles ok', async () => {
    const config = `
const config: Config = {
  // options passed to svelte.compile (https://svelte.dev/docs#compile-time-svelte-compile)
  compilerOptions: {},
 
  // an array of file extensions that should be treated as Svelte components
  extensions: ['.svelte'],
 
  kit: {
    adapter: undefined,
    alias: {},
    appDir: '_app',
    csp: {
      mode: 'auto',
      directives: {
        'default-src': undefined
        // ...
      }
    },
    csrf: {
      checkOrigin: true
    },
    env: {
      dir: process.cwd(),
      publicPrefix: 'PUBLIC_'
    },
    files: {
      assets: 'static',
      hooks: {
        client: 'src/hooks.client',
        server: 'src/hooks.server'
      },
      lib: 'src/my/lib',
      params: 'src/my/params',
      routes: 'src/my/routes',
      serviceWorker: 'src/my/service-worker',
      appTemplate: 'src/my/app.html',
      errorTemplate: 'src/my/error.html'
    },
    inlineStyleThreshold: 0,
    moduleExtensions: ['.js', '.ts'],
    outDir: '.svelte-kit',
    paths: {
      assets: '',
      base: ''
    },
    prerender: {
      concurrency: 1,
      crawl: true,
      enabled: true,
      entries: ['*'],
      onError: 'fail',
      origin: 'http://sveltekit-prerender'
    },
    trailingSlash: 'never',
    version: {
      name: Date.now().toString(),
      pollInterval: 0
    }
  }
 
};
 
export default config;`;
    const { routes, lib, params } = getSvelteFiles(config);
    expect(routes).toEqual('src/my/routes');
    expect(lib).toEqual('src/my/lib');
    expect(params).toEqual('src/my/params');
  });

  it('minimal getSvelteFiles', async () => {
    const config = `const config = {
  kit: {
    files: {
      lib: 'src/my/lib',
      params: 'src/my/params',
      routes: 'src/my/routes',
    }
  }
};
 
export default config;`;
    const { routes, lib, params } = getSvelteFiles(config);
    expect(routes).toEqual('src/my/routes');
    expect(lib).toEqual('src/my/lib');
    expect(params).toEqual('src/my/params');
  });

  it('no config getSvelteFiles', async () => {
    const config = `const config = {}; export default config;`;
    const { routes, lib, params } = getSvelteFiles(config);
    expect(routes).toEqual('src/routes');
    expect(lib).toEqual('src/lib');
    expect(params).toEqual('src/params');
  });

  it('inferSourceDirectory', async () => {
    expect(
      inferSourceDirectory({
        lib: 'src/lib',
        params: 'src/params',
        routes: 'src/routes',
      })
    ).toEqual('src');

    expect(
      inferSourceDirectory({
        assets: 'static',
        hooks: {
          client: 'sorcery/hooks.client',
          server: 'sorcery/hooks.server',
        },
        lib: 'sorcery/my/lib',
        params: 'sorcery/my/params',
        routes: 'sorcery/my/routes',
        serviceWorker: 'sorcery/my/service-worker',
        appTemplate: 'sorcery/my/app.html',
        errorTemplate: 'sorcery/my/error.html',
      })
    ).toEqual('sorcery/my');
  });
});

describe('runes', () => {
  let appTree: Tree;

  beforeEach(async () => {
    appTree = createTreeWithEmptyWorkspace({ layout: 'apps-libs' });
  });

  it('supportsRunes', () => {
    createSvelteKitApp(appTree, '5.0.0', {
      directory: 'apps',
      name: 'web',
      skipFormat: true,
    });
    expect(supportsRunes(appTree, { root: 'apps/web' })).toEqual({
      supports: true,
      svelte: '5.0.0',
    });
  });
  it('does not supportsRunes', () => {
    createSvelteKitApp(appTree, '4.0.0', {
      directory: 'apps',
      name: 'web',
      skipFormat: true,
    });
    expect(supportsRunes(appTree, { root: 'apps/web' })).toEqual({
      supports: false,
      svelte: '4.0.0',
    });
  });
});
