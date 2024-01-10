import {
  addDependenciesToPackageJson,
  formatFiles,
  installPackagesTask,
  readJson,
  type Tree,
} from '@nx/devkit';
import {
  chromeTypingsVersion,
  sassVersion,
  eslintVersion,
} from '../../utils/versions';
import type { Schema as InitGeneratorSchema } from './schema';

export default async function (
  tree: Tree,
  options: InitGeneratorSchema
): Promise<() => void> {
  const { devDependencies } = readJson<{
    devDependencies: Record<string, string>;
  }>(tree, 'package.json');
  const nxVersion = devDependencies['nx'];

  const installTask = addDependenciesToPackageJson(
    tree,
    {},
    {
      '@nx/webpack': nxVersion,
      '@types/chrome': chromeTypingsVersion,
      'html-webpack-plugin': '^5.0.0',
      'mini-css-extract-plugin': '^2.0.0',
      eslint: eslintVersion,
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
}
