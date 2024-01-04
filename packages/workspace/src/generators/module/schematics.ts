import { type ProjectConfiguration } from '@nx/devkit';
import { type GbModuleOptions } from 'gb-schematics';
import { type Schema } from './schema';

export function optionsForSchematic(
  project: ProjectConfiguration,
  options: Schema
): GbModuleOptions {
  const { name, kind, unitTestRunner, directory } = options;
  const { sourceRoot } = project;

  const schematicOptions: GbModuleOptions = {
    name,
    directory,
    kind,
    unitTestRunner,
    inSourceTests: true,
    sourceRoot: sourceRoot === '.' ? '' : sourceRoot,
  };

  return schematicOptions;
}
