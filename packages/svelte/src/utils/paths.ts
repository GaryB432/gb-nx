import type { ProjectConfiguration, Tree } from '@nrwl/devkit';
import { joinPathFragments } from '@nrwl/devkit';

interface Package {
  dependencies?: Record<string, string>;
  devDependencies?: Record<string, string>;
  name: string;
  version: string;
}

export function readPackageJson(
  tree: Tree,
  config: ProjectConfiguration
): Package | undefined {
  const pb = tree.read(joinPathFragments(config.root, 'package.json'));
  if (pb) {
    const pack = JSON.parse(pb.toString()) as Package;
    return pack;
  }
}

export function readModulePackageJson(
  tree: Tree,
  mod: string,
  root: string
): Package | undefined {
  return readPackageJson(tree, {
    root: joinPathFragments(root, 'node_modules', mod),
  });
}

export function makeAliasName(name: string, scope?: string): string {
  if (!scope) {
    return name;
  }
  if (!name) {
    return '';
  }
  return ['@'.concat(scope), name].join('/');
}
