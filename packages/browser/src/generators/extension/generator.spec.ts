jest.mock('@nx/eslint');
jest.mock('@nx/jest');

import {
  addDependenciesToPackageJson,
  readJson,
  readProjectConfiguration,
  type Tree,
} from '@nx/devkit';
import { createTreeWithEmptyWorkspace } from '@nx/devkit/testing';
import * as nxeslint from '@nx/eslint';
import * as nxjest from '@nx/jest';
import { uniq } from '@nx/plugin/testing';
import { type ManifestSchema } from '../../manifest/manifest';
import extensionGenerator from './generator';

describe('extension', () => {
  let tree: Tree;
  beforeEach(async () => {
    tree = createTreeWithEmptyWorkspace({ layout: 'apps-libs' });

    addDependenciesToPackageJson(tree, {}, { nx: '>1.0.0' });

    (nxeslint.lintProjectGenerator as jest.Mock).mockImplementation(
      (_a: Tree, b) => {
        if (b.linter !== nxeslint.Linter.EsLint) {
          throw new Error('only eslint');
        }
      }
    );

    (nxjest.configurationGenerator as jest.Mock).mockImplementation(
      (_a: Tree, b) => {
        if (b.testEnvironment !== 'jsdom') {
          throw new Error('s/b jsdom');
        }
      }
    );
    jest.clearAllMocks();
  });

  it('should work generally', async () => {
    const name = uniq('sut');

    const directory = `apps/${name}`;
    await extensionGenerator(tree, {
      name,
      directory,
      projectNameAndRootFormat: 'as-provided',
      skipFormat: true,
    });

    expect(tree.exists(`${directory}/src/main.ts`)).toBeTruthy();
    expect(tree.exists(`${directory}/src/scripts/sw.ts`)).toBeTruthy();
    expect(
      tree.exists(`${directory}/src/scripts/${name}.content_script.ts`)
    ).toBeTruthy();

    expect(nxeslint.lintProjectGenerator).toHaveBeenCalledWith(
      expect.anything(),
      {
        linter: 'eslint',
        project: name,
        skipFormat: true,
        addPlugin: true,
      }
    );
    expect(nxjest.configurationGenerator).toHaveBeenCalledWith(
      expect.anything(),
      {
        project: name,
        setupFile: 'none',
        skipFormat: true,
        skipSerializers: true,
        supportTsx: false,
        testEnvironment: 'jsdom',
        skipPackageJson: false,
        addPlugin: true,
      }
    );

    const rpconf = readProjectConfiguration(tree, name);
    expect(rpconf.targets!['build'].executor).toEqual('@nx/webpack:webpack');
    expect(rpconf.targets!['zip']).toEqual({
      dependsOn: ['build:production'],
      executor: '@gb-nx/browser:zip',
      options: {
        outputFileName: `{workspaceRoot}/zip/${name}.extension@{manifestVersion}.zip`,
      },
      outputs: ['{options.outputFileName}'],
    });

    const manifest = readJson<ManifestSchema>(
      tree,
      `${directory}/src/manifest.json`
    );
    expect(manifest.content_scripts).toContainEqual({
      js: [`${name}.content_script.js`],
      matches: ['http://localhost/*', `https://*.${name}.com/*`],
    });

    expect(
      readJson(tree, `${directory}/tsconfig.json`).references.length
    ).toBeGreaterThan(0);
  });

  it('should skip eslint', async () => {
    const name = uniq('sut');

    const directory = `apps/${name}`;
    await extensionGenerator(tree, {
      name,
      directory,
      projectNameAndRootFormat: 'as-provided',
      skipFormat: true,
      linter: nxeslint.Linter.None,
    });

    expect(nxeslint.lintProjectGenerator).not.toHaveBeenCalled();
  });
  it('should skip eslint', async () => {
    const name = uniq('sut');

    const directory = `apps/${name}`;
    await extensionGenerator(tree, {
      name,
      directory,
      projectNameAndRootFormat: 'as-provided',
      skipFormat: true,
      unitTestRunner: 'none',
      linter: nxeslint.Linter.EsLint,
    });

    expect(nxjest.configurationGenerator).not.toHaveBeenCalled();
  });
});
