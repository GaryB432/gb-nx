import { createTreeWithEmptyWorkspace } from '@nrwl/devkit/testing';
import { Tree, readProjectConfiguration } from '@nrwl/devkit';

import generator from './generator';
import { Schema as NxJunitGeneratorSchema } from './schema';

describe('junit generator', () => {
  let appTree: Tree;
  const options: NxJunitGeneratorSchema = { projectName: 'test' };

  const po = {
    targets: {
      test: {
        executor: '@nrwl/jest:jest',
        outputs: ['coverage/apps/test'],
        options: { jestConfig: 'apps/test/jest.config.js' },
      },
    },
  };

  const fddf = { version: 2, projects: { test: 'apps/test' } };

  const jc = (module.exports = {
    displayName: 'test',
    junk: 'sure',
  });

  beforeEach(() => {
    appTree = createTreeWithEmptyWorkspace();
    // console.log(po.targets.test.options.jestConfig);
    appTree.write('workspace.json', JSON.stringify(fddf));
    appTree.write('apps/test/project.json', JSON.stringify(po));
    // appTree.write(
    //   po.targets.test.options.jestConfig,
    //   "module.exports = { displayName: 'test', junk: 'yes' };"
    // );
    // console.log(appTree.listChanges());
  });

  it.skip('should run successfully', async () => {
    await generator(appTree, options);
    const config = readProjectConfiguration(appTree, 'test');
    expect(config).toBeDefined();
  });
});
