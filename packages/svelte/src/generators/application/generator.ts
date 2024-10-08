import {
  addDependenciesToPackageJson,
  addProjectConfiguration,
  ensurePackage,
  formatFiles,
  installPackagesTask,
  joinPathFragments,
  readJson,
  updateJson,
  writeJson,
  type GeneratorCallback,
  type ProjectConfiguration,
  type Tree,
} from '@nx/devkit';
import { Linter, lintProjectGenerator } from '@nx/eslint';
import { initGenerator as jsInitGenerator } from '@nx/js';
import { type PackageJson } from 'nx/src/utils/package-json';
import { type Config as PrettierConfig } from 'prettier';
import { includes } from '../../utils/globber';
import { makeAliasName } from '../../utils/paths';
import { isSvelte } from '../../utils/svelte';
import {
  eslintPluginSvelteVersion,
  prettierPluginSvelteVersion,
  prettierVersion,
} from '../../utils/versions';
import { type Schema as ApplicationGeneratorOptions } from './schema';

interface NormalizedOptions extends ApplicationGeneratorOptions {
  parsedTags: string[];
  projectRoot: string;
}

async function normalizeOptions(
  _tree: Tree,
  options: ApplicationGeneratorOptions
): Promise<NormalizedOptions> {
  const projectRoot = options.projectPath;

  const parsedTags = options.tags
    ? options.tags.split(',').map((s) => s.trim())
    : [];

  return {
    ...options,
    parsedTags,
    projectRoot,
  };
}

export async function addLintingToApplication(
  tree: Tree,
  project: ProjectConfiguration,
  options: NormalizedOptions
): Promise<void> {
  await lintProjectGenerator(tree, {
    linter: Linter.EsLint,
    project: project.name ?? '',
    // tsConfigPaths: [joinPathFragments(project.root, 'tsconfig.base.json')],
    unitTestRunner: 'vitest', // TODO hardcoded??
    skipFormat: options.skipFormat ?? false,
    setParserOptionsProject: false,
    rootProject: false, // TODO handle
  });

  updateJson(
    tree,
    joinPathFragments(project.root, '.eslintrc.json'),
    (lintConfig) => {
      lintConfig.extends.push(
        'plugin:@typescript-eslint/recommended',
        'plugin:svelte/recommended'
      );
      lintConfig.ignorePatterns.push('node_modules/*', '.svelte-kit/*');
      lintConfig.overrides.push({
        files: ['*.svelte'],
        parser: 'svelte-eslint-parser',
        parserOptions: {
          parser: '@typescript-eslint/parser',
        },
        rules: {},
      });
      return lintConfig;
    }
  );
}

function addWorkspaceToPackageJson(
  tree: Tree,
  options: NormalizedOptions,
  packageJsonPath = 'package.json'
): void {
  updateJson<PackageJson>(tree, packageJsonPath, (json) => {
    json.workspaces = json.workspaces ?? [];
    if (Array.isArray(json.workspaces)) {
      if (!includes(options.projectRoot, json.workspaces)) {
        json.workspaces.push(options.projectRoot);
        json.workspaces.sort();
      }
    } else {
      throw new Error('TODO handle');
    }
    return json;
  });
}

function updatePrettier(tree: Tree, options: NormalizedOptions) {
  const updateConfig = () => {
    const prettierrc = '.prettierrc';
    if (!tree.exists(prettierrc)) {
      writeJson(tree, prettierrc, { singleQuote: true });
    }

    updateJson<PrettierConfig, PrettierConfig>(tree, prettierrc, (json) => {
      json.plugins = json.plugins ?? [];
      if (!json.plugins.includes('prettier-plugin-svelte')) {
        json.plugins.push('prettier-plugin-svelte');
      }
      json.overrides = json.overrides ?? [];
      if (!json.overrides.some((t) => t.files === '*.svelte')) {
        json.overrides.push({
          files: '*.svelte',
          options: { parser: 'svelte' },
        });
      }
      return json;
    });
  };
  const updateIgnore = () => {
    const fname = '.prettierignore';
    const tbs = ['.svelte-kit', 'build'];
    const newPatterns = tbs.map((p) =>
      joinPathFragments(options.projectRoot, p)
    );

    const content =
      tree.read(fname, 'utf-8') ??
      [
        '# Add files here to ignore them from prettier formatting',
        '/dist',
        '/coverage',
        '/.nx/cache',
      ].join('\n');

    const patterns = content.split('\n');

    const lines = patterns
      .concat(newPatterns.filter((p) => !patterns.includes(p)))
      .concat('');

    tree.write(fname, lines.join('\n'));
  };
  addDependenciesToPackageJson(
    tree,
    {},
    {
      'eslint-plugin-svelte': eslintPluginSvelteVersion,
      prettier: prettierVersion,
      'prettier-plugin-svelte': prettierPluginSvelteVersion,
    }
  );
  ensurePackage('prettier-plugin-svelte', prettierPluginSvelteVersion);
  updateConfig();
  updateIgnore();
}

export default async function (
  tree: Tree,
  options: ApplicationGeneratorOptions
): Promise<GeneratorCallback> {
  const notSvelte = (p: string) =>
    `project at '${p}' is not configured for svelte`;

  const normalizedOptions = await normalizeOptions(tree, options);
  const project: ProjectConfiguration = {
    root: normalizedOptions.projectRoot,
    projectType: 'application',
    namedInputs: {
      default: ['{projectRoot}/**/*'],
      production: [
        '!{projectRoot}/.svelte-kit/*',
        '!{projectRoot}/build/*',
        '!{projectRoot}/tests/*',
      ],
    },
    targets: {
      build: {
        inputs: ['production', '^production'],
        outputs: ['{projectRoot}/build'],
        dependsOn: ['^build'],
      },
    },
    tags: normalizedOptions.parsedTags,
  };

  if (!isSvelte(tree, normalizedOptions.projectRoot)) {
    throw new Error(notSvelte(normalizedOptions.projectRoot));
  }

  const webPackageJsonPath = joinPathFragments(
    normalizedOptions.projectRoot,
    'package.json'
  );

  const { name } = readJson<PackageJson>(tree, webPackageJsonPath);
  project.name = name;
  updateJson(tree, webPackageJsonPath, (json) => {
    json.name = makeAliasName('source', project.name);
    return json;
  });

  await jsInitGenerator(tree, {
    skipFormat: normalizedOptions.skipFormat,
    tsConfigName: 'tsconfig.base.json',
  });

  project.sourceRoot = `${project.root}/src`;
  addProjectConfiguration(tree, project.name, project);

  updatePrettier(tree, normalizedOptions);
  addWorkspaceToPackageJson(tree, normalizedOptions, 'package.json');

  if (normalizedOptions.eslint) {
    await addLintingToApplication(tree, project, normalizedOptions);
  }

  if (!options.skipFormat) {
    await formatFiles(tree);
  }

  return async () => {
    installPackagesTask(tree);
  };
}
