import type { Tree } from '@nrwl/devkit';
import { parseJson, readJson, readProjectConfiguration } from '@nrwl/devkit';
import { createTreeWithEmptyWorkspace } from '@nrwl/devkit/testing';
import type { Schema } from '@nrwl/node/src/generators/application/schema';
import applicationGenerator from './application';

describe('app', () => {
  let appTree: Tree;
  beforeEach(() => {
    appTree = createTreeWithEmptyWorkspace({ layout: 'apps-libs' });
  });

  describe('not nested', () => {
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
    it('should add target', async () => {
      await generateApp(appTree);
      const proj = readProjectConfiguration(appTree, 'my-app');
      const targets = proj.targets ?? {};
      expect(targets['sync'].executor).toEqual('nx:run-commands');
    });
  });

  describe('nested', () => {
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
