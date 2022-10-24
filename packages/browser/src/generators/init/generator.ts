import {
  addDependenciesToPackageJson,
  formatFiles,
  installPackagesTask,
  type Tree,
} from '@nrwl/devkit';
import { chromeTypingsVersion, sassVersion } from '../../utils/versions';
import type { Schema as InitGeneratorSchema } from './schema';

export default async function (
  tree: Tree,
  options: InitGeneratorSchema
): Promise<() => void> {
  const installTask = addDependenciesToPackageJson(
    tree,
    {},
    {
      '@types/chrome': chromeTypingsVersion,
      sass: sassVersion,
    }
  );
  if (!options.skipFormat) {
    await formatFiles(tree);
  }
  return async () => {
    await installTask();
    installPackagesTask(tree);
  };

  // return async () => {
  //   await installTask();
  // await initGenerator(tree, { ...normalizedOptions, skipFormat: true });
  // addFiles(tree, normalizedOptions);
  // await addJest(tree, normalizedOptions);
  // await addLint(tree, normalizedOptions);
  // await formatFiles(tree);
  // return installPackagesTask(tree);

  // await formatFiles(tree);

  ///

  // installPackagesTask(tree);

  // return async () => {
  //   formatFiles(tree);
  // };
  // };
}
