import type { GeneratorCallback, Tree } from '@nx/devkit';
import { addDependenciesToPackageJson, installPackagesTask } from '@nx/devkit';
import { initGenerator as NodeInit } from '@nx/node';
import type { Schema as InitGeneratorSchema } from '@nx/node/src/generators/init/schema';
import { eslintPluginGbVersion } from '../../utils/versions';

export default async function initGenerator(
  tree: Tree,
  options: InitGeneratorSchema
): Promise<GeneratorCallback> {
  await NodeInit(tree, options);
  addDependenciesToPackageJson(
    tree,
    {},
    { 'eslint-plugin-gb': eslintPluginGbVersion }
  );
  return () => {
    return installPackagesTask(tree, true);
  };
}
