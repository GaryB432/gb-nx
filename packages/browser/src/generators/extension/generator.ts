import type { GeneratorCallback, Tree } from '@nx/devkit';
import {
  addProjectConfiguration,
  formatFiles,
  generateFiles,
  installPackagesTask,
  joinPathFragments,
  names,
  offsetFromRoot,
  readJson,
  readProjectConfiguration,
  updateProjectConfiguration,
  writeJson,
} from '@nx/devkit';
import { Linter, lintProjectGenerator } from '@nx/eslint';
import { configurationGenerator as jestConfigGenerator } from '@nx/jest';
import { join } from 'path';
import type { ESLintConfiguration } from '../../utils/eslint';
import { addCustomConfig } from '../../utils/eslint';
import initGenerator from '../init/generator';
import { normalizeOptions } from './lib/normalize-options';
import type { ExtensionGeneratorOptions, NormalizedOptions } from './schema';

function addCustomLint(tree: Tree, options: NormalizedOptions): void {
  const projectRc = joinPathFragments(options.appProjectRoot, '.eslintrc.json');
  const customPath = 'eslint-custom.json';
  const rc = readJson(tree, projectRc) as ESLintConfiguration;
  writeJson(
    tree,
    projectRc,
    addCustomConfig(
      rc,
      joinPathFragments(offsetFromRoot(options.appProjectRoot), customPath)
    )
  );
  writeJson(tree, customPath, {
    overrides: [
      {
        files: ['*.ts'],
        rules: {
          '@typescript-eslint/no-unused-vars': 'off',
          '@typescript-eslint/member-ordering': 'warn',
        },
      },
      {
        files: ['*spec.ts'],
        rules: {
          '@typescript-eslint/no-non-null-assertion': 'warn',
        },
      },
    ],
  });
}

async function addJest(
  tree: Tree,
  options: NormalizedOptions
): Promise<GeneratorCallback> {
  return jestConfigGenerator(tree, {
    project: options.name,
    setupFile: 'none',
    supportTsx: false,
    skipSerializers: true,
    testEnvironment: 'jsdom',
    skipFormat: true,
    // compiler: options.compiler,
  });
}

function updateGitIgnore(tree: Tree) {
  const fn = '.gitignore';
  const newIgnore = 'zip';

  let lns = tree.read(fn, 'utf-8');
  lns ??=
    '# See http://help.github.com/ignore-files/ for more about ignoring files.';

  const ignoreds = lns.split(/[\r\n]/);

  if (!ignoreds.includes(newIgnore)) {
    tree.write(fn, [...ignoreds, newIgnore, ''].join('\n'));
  }
}

async function addLint(
  tree: Tree,
  options: NormalizedOptions
): Promise<GeneratorCallback> {
  const generateLint = lintProjectGenerator(tree, {
    project: options.appProjectName,
    linter: Linter.EsLint,
    skipFormat: true,
    eslintFilePatterns: [joinPathFragments(options.appProjectRoot, '**/*.ts')],
  });
  addCustomLint(tree, options);
  return generateLint;
}

function addFiles(tree: Tree, options: NormalizedOptions) {
  const templateOptions = {
    ...options,
    ...names(options.name),
    offsetFromRoot: offsetFromRoot(options.appProjectRoot),
    tmpl: '',
  };
  generateFiles(
    tree,
    join(__dirname, 'files'),
    options.appProjectRoot,
    templateOptions
  );
  tree.write('zip/.gitkeep', '');
}

export default async function (
  tree: Tree,
  options: ExtensionGeneratorOptions
): Promise<GeneratorCallback> {
  const normalizedOptions = await normalizeOptions(tree, options);
  addProjectConfiguration(tree, normalizedOptions.appProjectName, {
    root: normalizedOptions.appProjectRoot,
  });
  await initGenerator(tree, { ...normalizedOptions, skipFormat: true });
  addFiles(tree, normalizedOptions);

  const proj = readProjectConfiguration(tree, normalizedOptions.appProjectName);
  updateProjectConfiguration(tree, normalizedOptions.appProjectName, {
    ...proj,
    tags: options.tags ? options.tags.split(',').map((s) => s.trim()) : [],
  });
  await addJest(tree, normalizedOptions);
  await addLint(tree, normalizedOptions);
  updateGitIgnore(tree);
  if (!options.skipFormat) {
    await formatFiles(tree);
  }
  return () => {
    installPackagesTask(tree, true);
  };
}
