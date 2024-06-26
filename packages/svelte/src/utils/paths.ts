import {
  joinPathFragments,
  offsetFromRoot,
  type ProjectConfiguration,
  type Tree,
} from '@nx/devkit';
import { type PackageJson } from 'nx/src/utils/package-json';

export interface NamedPath {
  name: string;
  path: string;
}

export function readRootPackageJson(tree: Tree): PackageJson | undefined {
  const pb = tree.read('package.json', 'utf-8');
  return pb ? (JSON.parse(pb) as PackageJson) : undefined;
}

export function readPackageJson(
  tree: Tree,
  config: ProjectConfiguration
): PackageJson | undefined {
  const pb = tree.read(joinPathFragments(config.root, 'package.json'));
  if (pb) {
    const pack = JSON.parse(pb.toString()) as PackageJson;
    return pack;
  }
}

export function nodeResolutionPaths(root: string): string[] {
  return root
    .split('/')
    .map((_, i, lines) => {
      return lines.slice(0, i + 1).join('/');
    })
    .reverse();
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

export function dependencySourceRoot(
  project: ProjectConfiguration,
  dep: ProjectConfiguration
): string {
  return joinPathFragments(
    offsetFromRoot(project.root),
    dep.sourceRoot ?? joinPathFragments(dep.root, 'src')
  );
}
