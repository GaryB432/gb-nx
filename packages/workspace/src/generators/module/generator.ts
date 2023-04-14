import {
  formatFiles,
  getProjects,
  getWorkspaceLayout,
  type Tree,
} from '@nrwl/devkit';
import { wrapAngularDevkitSchematic } from '@nrwl/devkit/ngcli-adapter';
import initGenerator from '../init/generator';
import type { Schema as ModuleGeneratorSchema } from './schema';
import { directoryName } from './schematics';

interface SchematicOptions {
  directory?: string;
  inSourceTests?: boolean;
  kind?: 'class' | 'values';
  name: string;
  sourceRoot?: string;
  unitTestRunner?: 'jest' | 'vitest' | 'none';
}

export const libraryGenerator = wrapAngularDevkitSchematic(
  'gb-schematics',
  'module'
);

export default async function (
  tree: Tree,
  options: ModuleGeneratorSchema
): Promise<void> {
  const ws = getWorkspaceLayout(tree);
  const projects = getProjects(tree);
  const project = projects.get(options.project);

  if (!project) {
    throw new Error(`Project '${options.project}' was not found`);
  }
  const { name, kind, unitTestRunner } = options;

  const schematicOptions: SchematicOptions = {
    name,
    directory: directoryName(ws, project, options),
    kind,
    unitTestRunner,
    inSourceTests: true,
    sourceRoot: project.sourceRoot,
  };

  await initGenerator(tree, { ...options, skipFormat: true });
  await libraryGenerator(tree, schematicOptions);
  if (!options.skipFormat) {
    await formatFiles(tree);
  }
}
