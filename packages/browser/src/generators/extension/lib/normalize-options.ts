import type { Tree } from '@nx/devkit';
import { determineProjectNameAndRootOptions } from '@nx/devkit/src/generators/project-name-and-root-utils';
import { Linter } from '@nx/eslint';
import type { ExtensionGeneratorOptions, NormalizedOptions } from '../schema';

export async function normalizeOptions(
  tree: Tree,
  options: ExtensionGeneratorOptions
): Promise<NormalizedOptions> {
  const { projectName: appProjectName, projectRoot: appProjectRoot } =
    await determineProjectNameAndRootOptions(tree, {
      name: options.name,
      projectType: 'application',
      directory: options.directory,
      projectNameAndRootFormat: 'as-provided',
      rootProject: options.rootProject,
      callingGenerator: '@gb-nx/browser:extension',
    });
  options.rootProject = appProjectRoot === '.';

  return {
    ...options,
    strict: options.strict ?? false,
    appProjectName,
    appProjectRoot,
    linter: options.linter ?? Linter.EsLint,
    unitTestRunner: options.unitTestRunner ?? 'jest',
    tags: options.tags,
  };
}
