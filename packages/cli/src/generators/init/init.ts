import type { GeneratorCallback, Tree } from '@nrwl/devkit';
import {
  addDependenciesToPackageJson,
  installPackagesTask,
} from '@nrwl/devkit';
import { initGenerator as NodeInit } from '@nrwl/node';
import type { Schema as InitGeneratorSchema } from '@nrwl/node/src/generators/init/schema';
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
