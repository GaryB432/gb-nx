import { formatFiles, getProjects, type Tree } from '@nrwl/devkit';
import { wrapAngularDevkitSchematic } from '@nrwl/devkit/ngcli-adapter';
import initGenerator from '../init/generator';
import type { Schema as ModuleGeneratorSchema } from './schema';
import { optionsForSchematic } from './schematics';

export const libraryGenerator = wrapAngularDevkitSchematic(
  'gb-schematics',
  'module'
);

export default async function (
  tree: Tree,
  options: ModuleGeneratorSchema
): Promise<void> {
  const projects = getProjects(tree);
  const project = projects.get(options.project);

  if (!project) {
    throw new Error(`Project '${options.project}' was not found`);
  }

  await initGenerator(tree, { ...options, skipFormat: true });
  await libraryGenerator(tree, optionsForSchematic(project, options));
  if (!options.skipFormat) {
    await formatFiles(tree);
  }
}
