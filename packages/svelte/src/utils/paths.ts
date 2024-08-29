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

export function commonParentFolder(
  recordOfPaths: Record<string, unknown>
): string {
  const fdf = Object.values(recordOfPaths) as string[];

  return (
    findTopLevelCommonFolder(
      Object.values(fdf).filter((f) => typeof f === 'string')
    ) ?? 'src'
  );
}

function findTopLevelCommonFolder(folders: string[]): string | null {
  if (folders.length === 0) {
    return null;
  }

  const paths = folders.map((folder) => folder.split('/'));
  const shortestPath = paths.reduce((acc, path) =>
    path.length < acc.length ? path : acc
  );

  const commonPrefix = shortestPath.reduce((acc, segment, index) => {
    if (paths.every((path) => path[index] === segment)) {
      return acc + segment + '/';
    }
    return acc;
  }, '');

  return commonPrefix.length > 0 ? commonPrefix.slice(0, -1) : null;
}

// Tests
// const testCases: [string[], string | null][] = [
//   [["src/abc/def", "src/abc/ghi", "src/abc/fun/long", "src/abc/fun/more/names/here", "src/abc"], "src/abc"],
//   [["src/abc/def", "src/abc/ghi", "src/abc/fun/long", "src/abc/fun/more/names/here", "src/abc", "banana"], "src/abc"],
//   [["a/b/c", "a/b/d", "a/b/e"], "a/b"],
//   [["a/b", "c/d", "e/f"], null],
//   [["a"], "a"],
//   [[]], null
// ];

// testCases.forEach(([folders, expected]) => {
//   const result = findTopLevelCommonFolder(folders);
//   console.log(`Input: ${folders}, Expected: ${expected}, Result: ${result}`);
//   expect(result).toBe(expected);
// });
