import { type Tree, getProjects, updateProjectConfiguration } from '@nx/devkit';

export default function update(tree: Tree): void {
  const projects = getProjects(tree);

  for (const [, project] of projects) {
    if (!project.name) {
      continue;
    }

    if (project.projectType !== 'application') {
      continue;
    }

    let { targets } = project;

    targets ??= {};

    if ('zip' in targets) {
      // don't overwrite
      continue;
    }

    targets['zip'] = {
      executor: '@gb-nx/browser:zip',
      outputs: ['{options.outputFileName}'],
      dependsOn: ['build:production', 'build-scripts'],
      options: {
        outputFileName: `{workspaceRoot}/zip/${project.name}.extension@{manifestVersion}.zip`,
      },
    };

    updateProjectConfiguration(tree, project.name, project);
  }
}
