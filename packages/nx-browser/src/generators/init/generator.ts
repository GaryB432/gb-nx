import { addDependenciesToPackageJson, formatFiles, Tree } from '@nrwl/devkit';
import { setDefaultCollection } from '@nrwl/workspace/src/utilities/set-default-collection';
import { chromeTypingsVersion, sassVersion } from '../../utils/versions';
import { InitGeneratorSchema } from './schema';

export default async function (
  tree: Tree,
  options: InitGeneratorSchema
): Promise<() => void> {
  setDefaultCollection(tree, '@gb-nx/nx-browser-extension');
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
