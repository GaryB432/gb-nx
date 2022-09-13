import {
  addDependenciesToPackageJson,
  formatFiles,
  generateFiles,
  GeneratorCallback,
  getWorkspaceLayout,
  installPackagesTask,
  names,
  offsetFromRoot,
  ProjectConfiguration,
  readProjectConfiguration,
  TargetConfiguration,
  Tree,
} from '@nrwl/devkit';
import { applicationGenerator as nodeAppGenerator } from '@nrwl/node';
import { Schema as ApplicationGeneratorSchema } from '@nrwl/node/src/generators/application/schema';
import * as path from 'path';
import {
  ansiColorsVersion,
  eslintPluginGbVersion,
  nxVersion,
  sadeVersion,
} from '../../utils/versions';

interface NormalizedSchema extends ApplicationGeneratorSchema {
  projectName: string;
  projectRoot: string;
  projectDirectory: string;
  parsedTags: string[];
}

function normalizeOptions(
  tree: Tree,
  options: ApplicationGeneratorSchema
): NormalizedSchema {
  const name = names(options.name).fileName;
  const projectDirectory = options.directory
    ? `${names(options.directory).fileName}/${name}`
    : name;
  const projectName = projectDirectory.replace(new RegExp('/', 'g'), '-');
  const projectRoot = `${getWorkspaceLayout(tree).appsDir}/${projectDirectory}`;
  const parsedTags = options.tags
    ? options.tags.split(',').map((s) => s.trim())
    : [];

  return {
    ...options,
    projectName,
    projectRoot,
    projectDirectory,
    parsedTags,
  };
}

function addFiles(tree: Tree, options: NormalizedSchema) {
  const templateOptions = {
    ...options,
    ...names(options.name),
    offsetFromRoot: offsetFromRoot(options.projectRoot),
    template: '',
  };
  generateFiles(
    tree,
    path.join(__dirname, 'files'),
    options.projectRoot,
    templateOptions
  );
}

export default async function applicationGenerator(
  tree: Tree,
  options: ApplicationGeneratorSchema
): Promise<GeneratorCallback> {
  const normalizedOptions = normalizeOptions(tree, options);

  // await initGenerator(tree, {});
  await nodeAppGenerator(tree, normalizedOptions);

  // updateProjectConfiguration(tree, normalizedOptions.projectName, {
  //   root: normalizedOptions.projectRoot,
  //   projectType: 'application',
  //   sourceRoot: `${normalizedOptions.projectRoot}/src`,
  //   targets: {
  //     build: {
  //       executor: '@gb-nx/cli:build',
  //     },
  //   },
  //  type p tags: normalizedOptions.parsedTags,
  // });
  addFiles(tree, normalizedOptions);

  addDependenciesToPackageJson(
    tree,
    { 'ansi-colors': ansiColorsVersion, sade: sadeVersion },
    { '@nrwl/node': nxVersion }
  );
  await formatFiles(tree);
  return () => {
    installPackagesTask(tree, true);
  };
}
