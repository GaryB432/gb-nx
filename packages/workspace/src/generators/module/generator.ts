import { getProjects, ProjectType, Tree } from '@nrwl/devkit';
import { wrapAngularDevkitSchematic } from '@nrwl/devkit/ngcli-adapter';
import { Schema as ComponentGeneratorSchema } from './schema';

interface SchematicOptions {
  name: string;
  directory?: string;
  kind?: 'class' | 'values';
  skipTests?: boolean;
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

export default async function (tree: Tree, options: ComponentGeneratorSchema) {
  const projects = getProjects(tree);
  const project = projects.get(options.project);

  if (!project) {
    throw new Error(`Project '${options.project}' was not found`);
  }
  const { name, kind, skipTests } = options;

  const directory =
    options.directory ?? sourceSubfolder.get(project.projectType);

  const schematicOptions: SchematicOptions = {
    name,
    directory,
    kind,
    skipTests,
    sourceRoot: project.sourceRoot,
  };

  await libraryGenerator(tree, schematicOptions);
}
