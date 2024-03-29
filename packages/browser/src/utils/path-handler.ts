import { joinPathFragments } from '@nx/devkit';
import type { ParsedPath } from 'path';
import { parse } from 'path';

export function translateToOutputPath(
  sourcePath: string,
  sourceRoot: string,
  outputPath: string
): ParsedPath {
  const { root, base, name, ext } = changeExtension(parse(sourcePath), '.tbd');

  const rndx = sourcePath.indexOf(sourceRoot);

  if (rndx === -1) {
    throw new Error('source root not found');
  }

  const { dir } = parse(
    joinPathFragments(
      sourcePath.slice(0, rndx),
      outputPath,
      sourcePath.slice(rndx + sourceRoot.length + 1)
    )
  );

  return {
    base,
    dir,
    ext,
    name,
    root,
  };
}

export function changeExtension(path: ParsedPath, ext: string): ParsedPath {
  const { dir, name, root } = path;
  const base = name.concat(ext);
  return {
    base,
    dir,
    ext,
    name,
    root,
  };
}
