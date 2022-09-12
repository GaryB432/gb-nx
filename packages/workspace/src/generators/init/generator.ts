import {
  addDependenciesToPackageJson,
  formatFiles,
  GeneratorCallback,
  Tree,
} from '@nrwl/devkit';
import { runTasksInSerial } from '@nrwl/workspace/src/utilities/run-tasks-in-serial';
import {
  angularDevkitVersion,
  gbSchematicsVersion,
} from '../../utils/versions';
import { Schema } from './schema';

function updateDependencies(tree: Tree) {
  return addDependenciesToPackageJson(
    tree,
    {},
    {
      'gb-schematics': gbSchematicsVersion,
      '@angular-devkit/core': angularDevkitVersion,
    }
  );
}

export default async function initGenerator(host: Tree, schema: Schema) {
  const tasks: GeneratorCallback[] = [];
  const installTask = updateDependencies(host);
  tasks.push(installTask);

  if (!schema.skipFormat) {
    await formatFiles(host);
  }
  return runTasksInSerial(...tasks);
}
