import { type ProjectConfiguration } from '@nrwl/devkit';
import { type Schema } from './schema';

export interface SchematicOptions {
  directory?: string;
  inSourceTests?: boolean;
  kind?: 'class' | 'values';
  name: string;
  sourceRoot?: string;
  unitTestRunner?: 'jest' | 'vitest' | 'none';
}

export function optionsForSchematic(
  project: ProjectConfiguration,
  options: Schema
): SchematicOptions {
  const { name, kind, unitTestRunner, directory } = options;
  const { sourceRoot } = project;

  const schematicOptions: SchematicOptions = {
    name,
    directory,
    kind,
    unitTestRunner,
    inSourceTests: true,
    sourceRoot: sourceRoot === '.' ? '' : sourceRoot,
  };

  return schematicOptions;
}
