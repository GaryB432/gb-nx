import {
  addDependenciesToPackageJson,
  formatFiles,
  runTasksInSerial,
  type GeneratorCallback,
  type Tree,
} from '@nx/devkit';
import type { Schema } from './schema';

function updateDependencies(tree: Tree) {
  return addDependenciesToPackageJson(tree, {}, {});
}

export default async function initGenerator(
  host: Tree,
  schema: Schema
): Promise<GeneratorCallback> {
  const tasks: GeneratorCallback[] = [];
  const installTask = updateDependencies(host);
  tasks.push(installTask);

  if (!schema.skipFormat) {
    await formatFiles(host);
  }
  return runTasksInSerial(...tasks);
}
