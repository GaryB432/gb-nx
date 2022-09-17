import type { Tree } from '@nrwl/devkit';
import { addDependenciesToPackageJson, formatFiles } from '@nrwl/devkit';
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
  };
}
