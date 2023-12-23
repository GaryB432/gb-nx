import type { Tree } from '@nx/devkit';
import { parseJson, readJson, readProjectConfiguration } from '@nx/devkit';
import { createTreeWithEmptyWorkspace } from '@nx/devkit/testing';
import * as refresher from '../refresh/refresh';
import applicationGenerator from './application';

const mockRefresher = jest
  .spyOn(refresher, 'default')
  .mockImplementation(() => Promise.resolve());

describe('app', () => {
  let appTree: Tree;
  beforeEach(() => {
    appTree = createTreeWithEmptyWorkspace({ layout: 'apps-libs' });
    jest.clearAllMocks();
  });

  describe('not nested', () => {
    it('should generate files', async () => {
      await generateMyApp(appTree);

      expect(appTree.exists(`apps/my-app/jest.config.ts`)).toBeTruthy();
      expect(appTree.exists('apps/my-app-e2e')).toBeTruthy();
      expect(appTree.exists('apps/my-app/package.json')).toBeFalsy();
      expect(appTree.exists('apps/my-app/src/main.ts')).toBeTruthy();
      expect(appTree.exists('apps/my-app/src/app/shared.ts')).toBeTruthy();
      expect(mockRefresher).toHaveBeenCalledTimes(1);
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
      // expect(mockRefresher).toHaveBeenCalledWith({});
    });
    it('should add target', async () => {
      await generateMyApp(appTree);
      const proj = readProjectConfiguration(appTree, 'my-app');
      const targets = proj.targets ?? {};
      expect(targets['sync'].executor).toEqual('nx:run-commands');
    });
  });

  describe.skip('nested', () => {
    it('should generate files', async () => {
      await generateMyApp(appTree);
      expect(appTree.exists('apps/my-dir/my-app/src/main.ts')).toBeTruthy();
      expect(
        appTree.exists('apps/my-dir/my-app/src/app/shared.ts')
      ).toBeTruthy();
      expect(mockRefresher).toHaveBeenCalledTimes(1);
    });
  });
});

async function generateMyApp(appTree: Tree) {
  await applicationGenerator(appTree, {
    name: 'my-app',
    directory: 'apps/my-app',
    skipFormat: true,
  });
}
