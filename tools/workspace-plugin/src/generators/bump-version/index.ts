import {
  joinPathFragments,
  logger,
  readNxJson,
  readProjectConfiguration,
  type Tree,
} from '@nx/devkit';
import { type Schema as BumpVersionSchema } from './schema';
import semverInc = require('semver/functions/inc');

interface PackageJson {
  name: string;
  version: string;
}

export default async function (
  tree: Tree,
  schema: BumpVersionSchema
): Promise<void> {
  const project = schema.project ?? readNxJson(tree)?.defaultProject;

  if (!project) {
    throw new Error('missing project');
  }

  const projectConfig = readProjectConfiguration(tree, project);
  const pjName = joinPathFragments(projectConfig.root, 'package.json');
  const pjBuf = tree.read(pjName);
  if (pjBuf) {
    const pkg = JSON.parse(pjBuf.toString()) as PackageJson;
    const bumped = semverInc(pkg.version, schema.part) ?? '0.0.0';
    logger.info(`${pkg.name} ${pkg.version}->${bumped}`);
    pkg.version = bumped;
    tree.write(pjName, JSON.stringify(pkg, undefined, 2) + '\n');
  }
}
