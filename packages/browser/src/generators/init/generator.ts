import {
  addDependenciesToPackageJson,
  formatFiles,
  installPackagesTask,
  type Tree,
} from '@nx/devkit';
import {
  chromeTypingsVersion,
  sassVersion,
  nxVersion,
  eslintVersion,
} from '../../utils/versions';
import type { Schema as InitGeneratorSchema } from './schema';

export default async function (
  tree: Tree,
  options: InitGeneratorSchema
): Promise<() => void> {
  const installTask = addDependenciesToPackageJson(
    tree,
    {},
    {
      '@nx/webpack': nxVersion,
      '@types/chrome': chromeTypingsVersion,
      'html-webpack-plugin': '^5.5.0',
      'mini-css-extract-plugin': '^2.6.1',
      eslint: eslintVersion,
      sass: sassVersion,
      'webpack-merge': '^5.9.0',
    }
  );
  if (!options.skipFormat) {
    await formatFiles(tree);
  }
  return async () => {
    await installTask();
    installPackagesTask(tree);
  };
}

