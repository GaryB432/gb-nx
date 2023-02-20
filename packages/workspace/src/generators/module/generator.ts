import type { ProjectType, Tree } from '@nrwl/devkit';
import { formatFiles, getProjects } from '@nrwl/devkit';
import { wrapAngularDevkitSchematic } from '@nrwl/devkit/ngcli-adapter';
import initGenerator from '../init/generator';
import type { Schema as ComponentGeneratorSchema } from './schema';

interface SchematicOptions {
  directory?: string;
  kind?: 'class' | 'values';
  name: string;
  unitTestRunner?: 'jest' | 'vitest' | 'none';
  inSourceTests?: boolean;
  sourceRoot?: string;
}

const sourceSubfolder = new Map<ProjectType | undefined, string>([
  [undefined, ''],
  ['application', 'app'],
  ['library', 'lib'],
]);

export const libraryGenerator = wrapAngularDevkitSchematic(
  'gb-schematics',
  'module'
);

export default async function (
  tree: Tree,
  options: ComponentGeneratorSchema
): Promise<void> {
  const projects = getProjects(tree);
  const project = projects.get(options.project);

  if (!project) {
    throw new Error(`Project '${options.project}' was not found`);
  }
  const { name, kind, unitTestRunner } = options;

  const directory =
    options.directory ?? sourceSubfolder.get(project.projectType);

  const schematicOptions: SchematicOptions = {
    name,
    directory,
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
