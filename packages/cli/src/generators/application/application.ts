import type { GeneratorCallback, Tree } from '@nrwl/devkit';
import {
  addDependenciesToPackageJson,
  formatFiles,
  generateFiles,
  getWorkspaceLayout,
  installPackagesTask,
  names,
  offsetFromRoot,
  readProjectConfiguration,
  updateProjectConfiguration,
} from '@nrwl/devkit';
import { applicationGenerator as nodeAppGenerator } from '@nrwl/node';
import type { Schema as ApplicationGeneratorSchema } from '@nrwl/node/src/generators/application/schema';
import * as path from 'path';
import { chalkVersion, sadeVersion } from '../../utils/versions';
import refreshGenerator from '../refresh/refresh';

interface NormalizedSchema extends ApplicationGeneratorSchema {
  parsedTags: string[];
  projectDirectory: string;
  projectName: string;
  projectRoot: string;
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
  await nodeAppGenerator(tree, {
    unitTestRunner: 'jest',
    setParserOptionsProject: true,
    e2eTestRunner: 'none',
    ...normalizedOptions,
  });

  const nodeApp = readProjectConfiguration(tree, normalizedOptions.projectName);

  nodeApp.targets = nodeApp.targets ?? {};
  nodeApp.targets['sync'] = {
    executor: 'nx:run-commands',
    options: {
      commands: [
        {
          command: `node ./node_modules/nx/bin/nx.js g @gb-nx/cli:refresh --project ${normalizedOptions.projectName} --all`,
        },
      ],
    },
  };

  updateProjectConfiguration(tree, normalizedOptions.projectName, nodeApp);

  addFiles(tree, normalizedOptions);

  addDependenciesToPackageJson(
    tree,
    { chalk: chalkVersion, sade: sadeVersion },
    {}
  );
  await refreshGenerator(tree, {
    all: true,
    project: normalizedOptions.projectName,
  });
  await formatFiles(tree);
  return () => {
    installPackagesTask(tree, true);
  };
}
