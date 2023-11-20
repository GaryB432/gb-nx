import type { Tree } from '@nx/devkit';
import { readProjectConfiguration } from '@nx/devkit';
import { determineArtifactNameAndDirectoryOptions } from '@nx/devkit/src/generators/artifact-name-and-directory-utils';
import type { NormalizedSchema, Schema } from '../schema';

export async function normalizeOptions(
  tree: Tree,
  options: Schema
): Promise<NormalizedSchema> {
  const {
    artifactName: name,
    directory,
    fileName,
    filePath,
    project: projectName,
  } = await determineArtifactNameAndDirectoryOptions(tree, {
    artifactType: 'command',
    callingGenerator: '@gb-nx/cli:command',
    name: options.name,
    directory: options.directory,
    nameAndDirectoryFormat: 'as-provided',
  });

  const { root, sourceRoot } = readProjectConfiguration(tree, projectName);

  return {
    ...options,
    name,
    projectName,
    directory,
    fileName,
    filePath,
    projectSourceRoot: sourceRoot ?? root,
    projectRoot: root,
  };
}
