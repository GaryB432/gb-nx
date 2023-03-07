import {
  joinPathFragments,
  logger,
  readNxJson,
  readProjectConfiguration,
  Tree,
} from '@nrwl/devkit';
import { SchematicOptions } from './schema';
const semverInc = require('semver/functions/inc');

interface PackageJson {
  version: string;
  name: string;
}

export default async function (tree: Tree, schema: SchematicOptions) {
  const project = schema.project ?? readNxJson(tree)?.defaultProject;

  if (!project) {
    throw new Error('missing project');
  }

  const projectConfig = readProjectConfiguration(tree, project);
  const pjName = joinPathFragments(projectConfig.root, 'package.json');
  const pjBuf = tree.read(pjName);
  if (pjBuf) {
    const pkg = JSON.parse(pjBuf.toString()) as PackageJson;
    const bumped = semverInc(pkg.version, schema.part);
    logger.info(`${pkg.name} ${pkg.version}->${bumped}`);
    pkg.version = bumped;
    tree.write(pjName, JSON.stringify(pkg, undefined, 2) + '\n');
  }
  return () => {};
}
