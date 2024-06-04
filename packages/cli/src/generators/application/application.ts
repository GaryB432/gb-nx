import type { GeneratorCallback, Tree } from '@nx/devkit';
import {
  addDependenciesToPackageJson,
  formatFiles,
  generateFiles,
  installPackagesTask,
  names,
  offsetFromRoot,
  readProjectConfiguration,
  updateProjectConfiguration,
} from '@nx/devkit';
import { determineProjectNameAndRootOptions } from '@nx/devkit/src/generators/project-name-and-root-utils';
import { Linter } from '@nx/eslint';
import { applicationGenerator as nodeAppGenerator } from '@nx/node';
import type { Schema as NodeApplicationGeneratorOptions } from '@nx/node/src/generators/application/schema';
import * as path from 'path';
import { chalkVersion, sadeVersion } from '../../utils/versions';
import refreshGenerator from '../refresh/refresh';
import type { Schema as CliGeneratorOptions } from './schema';

interface NormalizedOptions extends CliGeneratorOptions {
  appProjectName: string;
  appProjectRoot: string;
}

function toNodeApplicationGeneratorOptions(
  options: NormalizedOptions
): NodeApplicationGeneratorOptions {
  return {
    name: options.name,
    directory: options.directory,
    // frontendProject: options.frontendProject,
    // projectNameAndRootFormat: options.projectNameAndRootFormat,
    projectNameAndRootFormat: 'as-provided',
    linter: (options.linter ?? 'none') as Linter,
    skipFormat: true,
    skipPackageJson: options.skipPackageJson,
    // standaloneConfig: options.standaloneConfig,
    tags: options.tags,
    unitTestRunner: options.unitTestRunner,
    e2eTestRunner: 'none',
    setParserOptionsProject: options.setParserOptionsProject,
    rootProject: options.rootProject,
    bundler: 'webpack', // Some features require webpack plugins such as TS transformers
    isNest: false,
    addPlugin: false, // TODO why
  };
}

async function normalizeOptions(
  tree: Tree,
  options: CliGeneratorOptions
): Promise<NormalizedOptions> {
  const { projectName: appProjectName, projectRoot: appProjectRoot } =
    await determineProjectNameAndRootOptions(tree, {
      name: options.name,
      projectType: 'application',
      directory: options.directory,
      projectNameAndRootFormat: 'as-provided',
      rootProject: options.rootProject,
      callingGenerator: '@gb-nx/cli:application',
    });
  options.rootProject = appProjectRoot === '.';

  return {
    ...options,
    strict: options.strict ?? false,
    appProjectName,
    appProjectRoot,
    linter: options.linter ?? Linter.EsLint,
    unitTestRunner: options.unitTestRunner ?? 'jest',
  };
}

function addFiles(tree: Tree, options: NormalizedOptions) {
  const templateOptions = {
    ...options,
    ...names(options.name),
    offsetFromRoot: offsetFromRoot(options.appProjectRoot),
    template: '',
  };
  generateFiles(
    tree,
    path.join(__dirname, 'files'),
    options.appProjectRoot,
    templateOptions
  );
}

export default async function applicationGenerator(
  tree: Tree,
  options: CliGeneratorOptions
): Promise<GeneratorCallback> {
  const normalizedOptions = await normalizeOptions(tree, options);

  // await initGenerator(tree, {});
  await nodeAppGenerator(
    tree,
    toNodeApplicationGeneratorOptions(normalizedOptions)
  );

  const nodeApp = readProjectConfiguration(
    tree,
    normalizedOptions.appProjectName
  );

  nodeApp.targets = nodeApp.targets ?? {};
  nodeApp.targets['sync'] = {
    executor: 'nx:run-commands',
    options: {
      commands: [
        {
          command: `node ./node_modules/nx/bin/nx.js g @gb-nx/cli:refresh --project ${normalizedOptions.appProjectName} --all`,
        },
      ],
    },
  };

  updateProjectConfiguration(tree, normalizedOptions.appProjectName, nodeApp);

  addFiles(tree, normalizedOptions);

  addDependenciesToPackageJson(
    tree,
    { chalk: chalkVersion, sade: sadeVersion },
    {}
  );
  await refreshGenerator(tree, {
    all: true,
    project: normalizedOptions.appProjectName,
  });

  if (!options.skipFormat) {
    await formatFiles(tree);
  }
  return () => {
    installPackagesTask(tree, true);
  };
}
