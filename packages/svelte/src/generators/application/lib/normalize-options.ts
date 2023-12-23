import type { Tree } from '@nx/devkit';
import { determineProjectNameAndRootOptions } from '@nx/devkit/src/generators/project-name-and-root-utils';
import type { ApplicationGeneratorOptions, NormalizedOptions } from '../schema';

export async function normalizeOptions(
  tree: Tree,
  options: ApplicationGeneratorOptions
): Promise<NormalizedOptions> {
  const { projectName: appProjectName, projectRoot: appProjectRoot } =
    await determineProjectNameAndRootOptions(tree, {
      name: '',
      projectType: 'application',
      directory: options.projectPath,
      projectNameAndRootFormat: 'as-provided',
      rootProject: false, // TODO add support
      callingGenerator: '@gb-nx/svelte:application',
    });
  // options.rootProject = appProjectRoot === '.';

  return {
    ...options,
    appProjectName,
    appProjectRoot,
  };
}
