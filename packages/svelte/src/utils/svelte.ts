import type { ProjectConfiguration, Tree } from '@nrwl/devkit';
import { joinPathFragments } from '@nrwl/devkit';
import { readModulePackageJson } from './paths';

export const SVELTE_CONFIG = 'svelte.config.js';

export interface NodeApplicationSchema {
  name: string;
  directory: string;
}

export function isSvelte(tree: Tree, config: ProjectConfiguration): boolean {
  return tree.exists(joinPathFragments(config.root, SVELTE_CONFIG));
}

export function getSvelteConfig(
  tree: Tree,
  config: ProjectConfiguration
): string | null {
  const buf = tree.read(joinPathFragments(config.root, SVELTE_CONFIG));
  return buf ? buf.toString() : null;
}

export function getSveltePackageVersions(
  tree: Tree,
  config: ProjectConfiguration
): { name: string; version: string | undefined }[] {
  return ['@sveltejs/kit', '@sveltejs/vite-plugin-svelte'].map((name) => {
    const pn = readModulePackageJson(tree, name, config.root);
    const version = pn?.version;
    return { name, version };
  });
}

export function createSvelteKitApp(
  appTree: Tree,
  version: string,
  options: NodeApplicationSchema
): void {
  const config0 = 'const config = { kit: {} };';

  const config = `/** @type {import('@sveltejs/kit').Config} */
  const config = {
    kit: {
      alias: {
        // this will match a file
        'my-file': 'path/to/my-file.js',
   
        // this will match a directory and its contents
        // (my-directory/x resolves to path/to/my-directory/x)
        'my-directory': 'path/to/my-directory',
   
        // an alias ending /* will only match
        // the contents of a directory, not the directory itself
        'my-directory/*': 'path/to/my-directory/*'
      },
      other: {
        'testing': 'yes'
      }
    }
  };`;
  const projectRoot = joinPathFragments(options.directory, options.name);
  appTree.write(joinPathFragments(projectRoot, 'svelte.config.js'), config);
  appTree.write(
    joinPathFragments(projectRoot, 'package.json'),
    JSON.stringify({
      name: options.name,
      version: '0.0.0',
      devDependencies: { 'prettier-plugin-svelte': '1.1.1' },
      nx: { ignore: false },
    })
  );

  appTree.write(
    joinPathFragments(projectRoot, 'node_modules/@sveltejs/kit/package.json'),
    JSON.stringify({
      name: '@sveltejs/kit',
      version,
      nx: { ignore: true },
    })
  );
  appTree.write(
    joinPathFragments(
      projectRoot,
      'node_modules/@sveltejs/vite-plugin-svelte/package.json'
    ),
    JSON.stringify({
      name: '@sveltejs/vite-plugin-svelte',
      version,
      nx: { ignore: true },
    })
  );
}
