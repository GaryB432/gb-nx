import {
  addDependenciesToPackageJson,
  formatFiles,
  getWorkspaceLayout,
  installPackagesTask,
  joinPathFragments,
  names,
  normalizePath,
  readJson,
  updateJson,
  type GeneratorCallback,
  type Tree,
} from '@nx/devkit';
import type {
  NxProjectPackageJsonConfiguration,
  PackageJson,
} from 'nx/src/utils/package-json';
import { updateEslint } from '../../utils/eslint';
import { isSvelte } from '../../utils/svelte';
import {
  eslintPluginGbVersion,
  eslintPluginSvelteVersion,
  eslintVersion,
  prettierPluginSvelteVersion,
  typescriptEslintVersion,
} from '../../utils/versions';
import type { Schema as ApplicationGeneratorSchema } from './schema';

const PRETTIER_PLUGIN_SVELTE = 'prettier-plugin-svelte';

const nx: NxProjectPackageJsonConfiguration = {
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

interface NormalizedSchema extends ApplicationGeneratorSchema {
  appsDir: string;
  parsedTags: string[];
  projectDirectory: string;
  projectName: string;
  projectRoot: string;
}

function normalizeOptions(
  tree: Tree,
  options: ApplicationGeneratorSchema
): NormalizedSchema {
  const { appsDir } = getWorkspaceLayout(tree);
  const name = names(options.name).fileName;
  const projectDirectory = options.directory
    ? `${names(options.directory).fileName}/${name}`
    : name;
  const projectName = projectDirectory.replace(new RegExp('/', 'g'), '-');
  const projectRoot = joinPathFragments(appsDir, projectDirectory);

  const parsedTags = options.tags
    ? options.tags.split(',').map((s) => s.trim())
    : [];

  return {
    ...options,
    appsDir,
    projectName,
    projectRoot,
    projectDirectory,
    parsedTags,
  };
}

function getWebPackage(
  tree: Tree,
  packageJsonPath: string
): Required<PackageJson> {
  const json = readJson(tree, packageJsonPath);
  json.devDependencies = json.devDependencies ?? {};
  return json;
}

function addNxConfig(tree: Tree, packageJsonPath: string): void {
  return updateJson<PackageJson>(tree, packageJsonPath, (json) => ({
    ...json,
    nx,
  }));
}

function addScriptsToPackageJson(
  tree: Tree,
  scripts: Record<string, string>,
  packageJsonPath: string
): void {
  return updateJson<PackageJson>(tree, packageJsonPath, (json) => {
    json.scripts = json.scripts ?? {};
    for (const script of Object.keys(scripts)) {
      json.scripts[script] = scripts[script];
    }
    return json;
  });
}

function addWorkspaceToPackageJson(
  tree: Tree,
  options: NormalizedSchema,
  packageJsonPath = 'package.json'
): void {
  updateJson<PackageJson>(tree, packageJsonPath, (json) => {
    json.workspaces = json.workspaces ?? [];
    if (Array.isArray(json.workspaces)) {
      json.workspaces.push(normalizePath(options.projectRoot));
      json.workspaces.sort();
    } else {
      throw new Error('TODO handle');
    }
    return json;
  });
}

function updatePrettierIgnore(tree: Tree, options: NormalizedSchema) {
  const fname = '.prettierignore';
  const tbs = ['.svelte-kit', 'build'];
  const newPatterns = tbs.map((p) => joinPathFragments(options.projectRoot, p));

  const buf = tree.read(fname);
  const content = buf
    ? buf.toString()
    : '# Add files here to ignore them from prettier formatting\n';

  const patterns = content.split('\n');

  const lines = patterns
    .concat(newPatterns.filter((p) => !patterns.includes(p)))
    .concat('');

  tree.write(fname, lines.join('\n'));
}

export default async function (
  tree: Tree,
  options: ApplicationGeneratorSchema
): Promise<GeneratorCallback> {
  const notSvelte = (p: string) =>
    `project '${p}' is not configured for svelte`;

  const normalizedOptions = normalizeOptions(tree, options);
  const config = { root: normalizedOptions.projectRoot };

  if (!isSvelte(tree, config)) {
    throw new Error(notSvelte(normalizedOptions.name));
  }

  const webPackageJsonPath = joinPathFragments(
    normalizedOptions.projectRoot,
    'package.json'
  );
  const webPackage = getWebPackage(tree, webPackageJsonPath);

  addDependenciesToPackageJson(
    tree,
    {},
    {
      [PRETTIER_PLUGIN_SVELTE]:
        webPackage.devDependencies[PRETTIER_PLUGIN_SVELTE] ??
        prettierPluginSvelteVersion,
    },
    'package.json'
  );

  addNxConfig(tree, webPackageJsonPath);

  updatePrettierIgnore(tree, normalizedOptions);
  addWorkspaceToPackageJson(tree, normalizedOptions, 'package.json');

  if (normalizedOptions.eslint) {
    // TODO use @nx/linter
    updateEslint(tree, config);
    addDependenciesToPackageJson(
      tree,
      {},
      {
        '@typescript-eslint/parser': typescriptEslintVersion,
      },
      webPackageJsonPath
    );
    addDependenciesToPackageJson(
      tree,
      {},
      {
        '@typescript-eslint/eslint-plugin': typescriptEslintVersion,
        '@typescript-eslint/parser': typescriptEslintVersion,
        eslint: eslintVersion,
        'eslint-plugin-gb': eslintPluginGbVersion,
        'eslint-plugin-svelte': eslintPluginSvelteVersion,
      },
      'package.json'
    );
    tree.write(
      joinPathFragments(normalizedOptions.projectRoot, 'tsconfig.base.json'),
      '{ "extends": "./tsconfig.json" }'
    );
    addScriptsToPackageJson(tree, { lint: 'eslint .' }, webPackageJsonPath);
  }

  await formatFiles(tree);

  return async () => {
    installPackagesTask(tree);
  };
}
