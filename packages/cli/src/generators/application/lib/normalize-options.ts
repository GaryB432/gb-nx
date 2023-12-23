import type { Tree } from '@nx/devkit';
import { determineProjectNameAndRootOptions } from '@nx/devkit/src/generators/project-name-and-root-utils';
import { Linter } from '@nx/linter';
import type { Schema as NodeApplicationGeneratorOptions } from '@nx/node/src/generators/application/schema';
import type { CliGeneratorOptions, NormalizedOptions } from '../schema';

export async function normalizeOptions(
  tree: Tree,
  options: CliGeneratorOptions
): Promise<NormalizedOptions> {
  const { projectName: appProjectName, projectRoot: appProjectRoot } =
    await determineProjectNameAndRootOptions(tree, {
      name: options.name,
      projectType: 'application',
      directory: options.directory,
      projectNameAndRootFormat: 'as-provided',
      rootProject: options.rootProject,
      callingGenerator: '@gb-nx/cli:application',
    });
  options.rootProject = appProjectRoot === '.';

  return {
    ...options,
    strict: options.strict ?? false,
    appProjectName,
    appProjectRoot,
    linter: options.linter ?? Linter.EsLint,
    unitTestRunner: options.unitTestRunner ?? 'jest',
    e2eTestRunner: options.e2eTestRunner ?? 'jest',
  };
}

export function toNodeApplicationGeneratorOptions(
  options: NormalizedOptions
): NodeApplicationGeneratorOptions {
  return {
    name: options.name,
    directory: options.directory,
    // frontendProject: options.frontendProject,
    // projectNameAndRootFormat: options.projectNameAndRootFormat,
    projectNameAndRootFormat: 'as-provided',
    linter: options.linter,
    skipFormat: true,
    skipPackageJson: options.skipPackageJson,
    // standaloneConfig: options.standaloneConfig,
    tags: options.tags,
    unitTestRunner: options.unitTestRunner,
    // TODO do we need e2e? it came from the nest port
    e2eTestRunner: options.e2eTestRunner,
    setParserOptionsProject: options.setParserOptionsProject,
    rootProject: options.rootProject,
    bundler: 'webpack', // Some features require webpack plugins such as TS transformers
    isNest: false,
  };
}
