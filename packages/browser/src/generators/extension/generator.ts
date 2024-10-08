import type { GeneratorCallback, Tree } from '@nx/devkit';
import {
  addDependenciesToPackageJson,
  addProjectConfiguration,
  formatFiles,
  generateFiles,
  installPackagesTask,
  names,
  offsetFromRoot,
  readProjectConfiguration,
  runTasksInSerial,
  updateProjectConfiguration,
} from '@nx/devkit';
import { determineProjectNameAndRootOptions } from '@nx/devkit/src/generators/project-name-and-root-utils';
import { Linter, lintProjectGenerator } from '@nx/eslint';
import { configurationGenerator as jestConfigGenerator } from '@nx/jest';
import { join } from 'path';
import type { Schema as ExtensionGeneratorOptions } from './schema';

interface NormalizedOptions extends ExtensionGeneratorOptions {
  appProjectName: string;
  appProjectRoot: string;
}

async function normalizeOptions(
  tree: Tree,
  options: ExtensionGeneratorOptions
): Promise<NormalizedOptions> {
  const { projectName: appProjectName, projectRoot: appProjectRoot } =
    await determineProjectNameAndRootOptions(tree, {
      name: options.name,
      projectType: 'application',
      directory: options.directory,
      projectNameAndRootFormat: 'as-provided',
      rootProject: options.rootProject,
      callingGenerator: '@gb-nx/browser:extension',
    });
  options.rootProject = appProjectRoot === '.';

  return {
    ...options,
    strict: options.strict ?? false,
    appProjectName,
    appProjectRoot,
    linter: options.linter ?? Linter.EsLint,
    unitTestRunner: options.unitTestRunner ?? 'jest',
    tags: options.tags,
  };
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
    skipPackageJson: false,
    addPlugin: true,
    // compiler: options.compiler,
  });
}

function updateGitIgnore(tree: Tree) {
  const fn = '.gitignore';
  const newIgnore = '/zip';

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
  return lintProjectGenerator(tree, {
    project: options.appProjectName,
    linter: Linter.EsLint,
    skipFormat: true,
    addPlugin: true,
  });
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
  // await initGenerator(tree, { ...normalizedOptions, skipFormat: true });

  const tasks: GeneratorCallback[] = [];

  tasks.push(
    addDependenciesToPackageJson(
      tree,
      {},
      {
        'adm-zip': '^0.5.10',
        ajv: '^8.0.0',
        '@types/chrome': '0.0.277',
        'html-webpack-plugin': '^5.0.0',
        'mini-css-extract-plugin': '^2.0.0', // TODO install only when needed
      }
    )
  );

  addFiles(tree, normalizedOptions);

  const proj = readProjectConfiguration(tree, normalizedOptions.appProjectName);
  updateProjectConfiguration(tree, normalizedOptions.appProjectName, {
    ...proj,
    tags: options.tags ? options.tags.split(',').map((s) => s.trim()) : [],
  });
  if (normalizedOptions.unitTestRunner === 'jest') {
    tasks.push(await addJest(tree, normalizedOptions));
  }
  if (normalizedOptions.linter === Linter.EsLint) {
    tasks.push(await addLint(tree, normalizedOptions));
  }
  updateGitIgnore(tree);
  if (!options.skipFormat) {
    await formatFiles(tree);
  }
  return () => {
    runTasksInSerial(...tasks);
    installPackagesTask(tree);
  };
}
