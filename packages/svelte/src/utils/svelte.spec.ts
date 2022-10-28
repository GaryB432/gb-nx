import type { Tree } from '@nrwl/devkit';
// import { readProjectConfiguration } from '@nrwl/devkit';
import { createTreeWithEmptyWorkspace } from '@nrwl/devkit/testing';
import { libraryGenerator } from '@nrwl/node';
import { createSvelteKitApp, getSvelteFiles } from './svelte';

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

  it('no getSvelteFiles', async () => {
    const config = `const config = {}; export default config;`;
    const { routes, lib, params } = getSvelteFiles(config);
    expect(routes).toEqual('src/routes');
    expect(lib).toEqual('src/lib');
    expect(params).toEqual('src/params');
  });
});
