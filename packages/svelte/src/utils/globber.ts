import { parse } from 'path';

export function includes(path: string, globs: string[]): boolean {
  const parsedPath = parse(path);
  for (const c of globs) {
    if (c === path) {
      return true;
    }
    const glob = parse(c);
    if (
      glob.base === '*' &&
      glob.root === parsedPath.root &&
      glob.dir === parsedPath.dir
    ) {
      return true;
    }
  }
  return false;
}
