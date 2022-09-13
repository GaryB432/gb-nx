import {
  addDependenciesToPackageJson,
  installPackagesTask,
  Tree,
} from '@nrwl/devkit';
import { initGenerator as NodeInit } from '@nrwl/node';
import { Schema as InitGeneratorSchema } from '@nrwl/node/src/generators/init/schema';
import { eslintPluginGbVersion, nxVersion } from '../../utils/versions';

export default async function initGenerator(tree: Tree, options: InitGeneratorSchema) {
  await NodeInit(tree, options);
  addDependenciesToPackageJson(
    tree,
    {},
    { '@nrwl/node': nxVersion, 'eslint-plugin-gb': eslintPluginGbVersion }
  );
  return () => {
    return installPackagesTask(tree, true);
  };
}
