import { installPackagesTask, readJson, Tree, writeJson } from '@nrwl/devkit';
import { SchematicOptions } from './schema';
const semverInc = require('semver/functions/inc');

interface PackageJson {
  version: string;
  name: string;
}

export default async function (tree: Tree, schema: SchematicOptions) {
  const path = 'package.json';
  const packageJson = readJson<PackageJson>(tree, path);
  packageJson.version = semverInc(packageJson.version, schema.part);
  writeJson(tree, path, packageJson);

  return () => {
    installPackagesTask(tree);
  };
}
