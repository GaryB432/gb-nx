import type { Tree } from '@nx/devkit';
import type { ApplicationGeneratorOptions, NormalizedOptions } from '../schema';

export async function normalizeOptions(
  tree: Tree,
  options: ApplicationGeneratorOptions
): Promise<NormalizedOptions> {
  if (!tree.exists(options.projectPath)) {
    throw new Error(`Could not find the projectPath provided`);
  }
  const projectRoot = options.projectPath;

  return {
    ...options,
    projectRoot,
  };
}
