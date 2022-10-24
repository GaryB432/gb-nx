import type { GeneratorCallback, Tree } from '@nrwl/devkit';
import { getProjects } from '@nrwl/devkit';
import { wrapAngularDevkitSchematic } from '@nrwl/devkit/ngcli-adapter';
import type { Schema as ComponentGeneratorSchema } from './schema';

export const libraryGenerator = wrapAngularDevkitSchematic(
  'gb-schematics',
  'sveltekit-route'
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
  await libraryGenerator(tree, {
    name: options.name,
    projectRoot: project.root,
  });
}
