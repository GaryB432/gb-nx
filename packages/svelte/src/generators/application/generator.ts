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
import {
  type NxProjectPackageJsonConfiguration,
  type PackageJson,
} from 'nx/src/utils/package-json';
import { includes } from '../../utils/globber';
import { makeAliasName } from '../../utils/paths';
import { isSvelte } from '../../utils/svelte';
import {
  eslintPluginSvelteVersion,
  prettierPluginSvelteVersion,
} from '../../utils/versions';
import { normalizeOptions } from './lib/normalize-options';
import { type Config as PrettierConfig } from './lib/prettier';
import {
  type ApplicationGeneratorOptions,
  type NormalizedOptions,
} from './schema';

const PRETTIER_PLUGIN_SVELTE = 'prettier-plugin-svelte';

export async function addLintingToApplication(
  tree: Tree,
  project: ProjectConfiguration,
  options: NormalizedOptions
): Promise<void> {
  await lintProjectGenerator(tree, {
    linter: Linter.EsLint,
    project: project.name!,
    // tsConfigPaths: [joinPathFragments(project.root, 'tsconfig.base.json')],
    unitTestRunner: 'vitest',
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
      lintConfig.ignorePatterns.push('.svelte-kit/*');
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
      if (!json.plugins.includes(PRETTIER_PLUGIN_SVELTE)) {
        json.plugins.push(PRETTIER_PLUGIN_SVELTE);
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

    let content = [
      '# Add files here to ignore them from prettier formatting',
      '/dist',
      '/coverage',
      '/.nx/cache',
    ].join('\n');

    if (tree.exists(fname)) {
      content = tree.read(fname, 'utf-8')!;
    }

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
      [PRETTIER_PLUGIN_SVELTE]: prettierPluginSvelteVersion,
      'eslint-plugin-svelte': eslintPluginSvelteVersion,
    }
  );
  ensurePackage(PRETTIER_PLUGIN_SVELTE, prettierPluginSvelteVersion);
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
  };

  if (!isSvelte(tree, project)) {
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
