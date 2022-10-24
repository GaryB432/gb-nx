import type { Tree } from '@nrwl/devkit';
import * as devkit from '@nrwl/devkit';
import { parseJson, readJson, readWorkspaceConfiguration } from '@nrwl/devkit';
import { createTreeWithEmptyWorkspace } from '@nrwl/devkit/testing';
import type { Schema } from '@nrwl/node/src/generators/application/schema';
import applicationGenerator from './application';

describe('app', () => {
  let appTree: Tree;
  beforeEach(() => {
    appTree = createTreeWithEmptyWorkspace();
  });

  describe('not nested', () => {
    xit('should update workspace.json', async () => {
      await generateApp(appTree);
      const workspaceJson = readJson(appTree, '/workspace.json');

      expect(workspaceJson.projects['my-app']).toMatchSnapshot();
      expect(workspaceJson.projects['my-app-e2e']).toMatchSnapshot();
    });

    it('should generate files', async () => {
      await generateApp(appTree);

      // expect(appTree.exists(`apps/my-app/jest.config.ts`)).toBeTruthy();
      expect(appTree.exists('apps/my-app/src/main.ts')).toBeTruthy();
      expect(appTree.exists('apps/my-app/src/app/shared.ts')).toBeTruthy();
      expect(appTree.read('apps/my-app/src/main.ts', 'utf-8')).toContain(
        "import sade = require('sade')"
      );

      const tsconfig = readJson(appTree, 'apps/my-app/tsconfig.json');
      expect(tsconfig.references).toContainEqual({
        path: './tsconfig.app.json',
      });
      expect(tsconfig.references).toContainEqual({
        path: './tsconfig.spec.json',
      });

      const tsconfigApp = parseJson(
        appTree.read('apps/my-app/tsconfig.app.json', 'utf-8') ?? 'nope'
      );
      expect(tsconfigApp.compilerOptions.outDir).toEqual('../../dist/out-tsc');
      expect(tsconfigApp.extends).toEqual('./tsconfig.json');
    });

    it('should set default project', async () => {
      await generateApp(appTree);
      const { defaultProject } = readWorkspaceConfiguration(appTree);
      expect(defaultProject).toBe('my-app');
    });

    it('should not overwrite default project if already set', async () => {
      const workspace = readWorkspaceConfiguration(appTree);
      workspace.defaultProject = 'some-awesome-project';
      devkit.updateWorkspaceConfiguration(appTree, workspace);

      await generateApp(appTree);

      const { defaultProject } = readWorkspaceConfiguration(appTree);
      expect(defaultProject).toBe('some-awesome-project');
    });
  });

  describe('nested', () => {
    xit('should update workspace.json', async () => {
      await generateApp(appTree, 'myApp', { directory: 'myDir' });
      const workspaceJson = readJson(appTree, '/workspace.json');

      expect(workspaceJson.projects['my-dir-my-app']).toMatchSnapshot();
      expect(workspaceJson.projects['my-dir-my-app-e2e']).toMatchSnapshot();
    });

    it('should generate files', async () => {
      await generateApp(appTree, 'myApp', { directory: 'myDir' });
      expect(
        appTree.read('apps/my-dir/my-app/src/main.ts')!.toString()
      ).toContain("const prog = sade('my-dir-my-app');");
    });
  });
});

async function generateApp(
  appTree: Tree,
  name = 'myApp',
  options: Partial<Schema> = {}
) {
  await applicationGenerator(appTree, {
    name,
    skipFormat: false,
    ...options,
  });
}
