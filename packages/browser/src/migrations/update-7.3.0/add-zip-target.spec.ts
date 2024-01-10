import { createTreeWithEmptyWorkspace } from '@nx/devkit/testing';
import {
  Tree,
  addProjectConfiguration,
  readProjectConfiguration,
} from '@nx/devkit';

import update from './add-zip-target';

describe('add-zip-target migration', () => {
  let tree: Tree;

  beforeEach(() => {
    tree = createTreeWithEmptyWorkspace({ layout: 'apps-libs' });
  });

  it('should run successfully', async () => {
    addProjectConfiguration(tree, 'sut-project', {
      root: 'some/where',
      projectType: 'application',
      targets: {
        publish: {
          command:
            'node tools/scripts/publish.mjs browser {args.ver} {args.tag}',
          dependsOn: ['build'],
        },
        lint: {
          executor: '@nx/eslint:lint',
          outputs: ['{options.outputFile}'],
        },
      },
    });
    update(tree);
    const project = readProjectConfiguration(tree, 'sut-project');
    expect(project.targets).toEqual({
      publish: {
        command: 'node tools/scripts/publish.mjs browser {args.ver} {args.tag}',
        dependsOn: ['build'],
      },
      lint: {
        executor: '@nx/eslint:lint',
        outputs: ['{options.outputFile}'],
      },
      zip: {
        executor: '@gb-nx/browser:zip',
        outputs: ['{options.outputFileName}'],
        dependsOn: ['build:production', 'build-scripts'],
        options: {
          outputFileName:
            '{workspaceRoot}/zip/sut-project.extension@{manifestVersion}.zip',
        },
      },
    });
  });
  it('should not overwrite', async () => {
    addProjectConfiguration(tree, 'sut-project', {
      root: 'some/where',
      projectType: 'application',
      targets: {
        zip: {
          command: 'yep',
        },
        lint: {
          executor: '@nx/eslint:lint',
          outputs: ['{options.outputFile}'],
        },
      },
    });
    update(tree);
    const project = readProjectConfiguration(tree, 'sut-project');
    expect(project.targets).toEqual({
      lint: {
        executor: '@nx/eslint:lint',
        outputs: ['{options.outputFile}'],
      },
      zip: {
        command: 'yep',
      },
    });
  });
});
