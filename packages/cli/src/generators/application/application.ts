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
import { applicationGenerator as nodeAppGenerator } from '@nx/node';
import * as path from 'path';
import { chalkVersion, sadeVersion } from '../../utils/versions';
import refreshGenerator from '../refresh/refresh';
import {
  normalizeOptions,
  toNodeApplicationGeneratorOptions,
} from './lib/normalize-options';
import type { CliGeneratorOptions, NormalizedOptions } from './schema';

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
