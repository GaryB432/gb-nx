import {
  NX_VERSION,
  addDependenciesToPackageJson,
  formatFiles,
  installPackagesTask,
  type Tree,
} from '@nx/devkit';
import type { Schema as InitGeneratorSchema } from './schema';

export default async function (
  tree: Tree,
  options: InitGeneratorSchema
): Promise<() => void> {
  const installTask = addDependenciesToPackageJson(
    tree,
    {},
    {
      ['@nx/devkit']: NX_VERSION,
      ['@nx/eslint']: NX_VERSION,
      ['@nx/jest']: NX_VERSION,
      ['@nx/webpack']: NX_VERSION,
    },
    undefined,
    false
  );
  if (!options.skipFormat) {
    await formatFiles(tree);
  }
  return async () => {
    await installTask();
    installPackagesTask(tree);
  };
}
