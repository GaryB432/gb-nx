import type { Tree } from '@nx/devkit';
import type { ApplicationGeneratorOptions, NormalizedOptions } from '../schema';

export async function normalizeOptions(
  _tree: Tree,
  options: ApplicationGeneratorOptions
): Promise<NormalizedOptions> {
  const projectRoot = options.projectPath;

  return {
    ...options,
    projectRoot,
  };
}
