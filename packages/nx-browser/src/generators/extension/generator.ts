import {
  addProjectConfiguration,
  formatFiles,
  generateFiles,
  GeneratorCallback,
  getWorkspaceLayout,
  joinPathFragments,
  names,
  offsetFromRoot,
  readJson,
  Tree,
  writeJson,
} from '@nrwl/devkit';
import { jestProjectGenerator } from '@nrwl/jest';
import { Linter, lintProjectGenerator } from '@nrwl/linter';
import { join } from 'path';
import initGenerator from '../init/generator';
import { ExtensionGeneratorSchema } from './schema';

interface LintOverride {
  files: string[];
  extends?: string[];
}

interface NormalizedSchema extends ExtensionGeneratorSchema {
  parsedTags: string[];
  projectDirectory: string;
  projectName: string;
  projectRoot: string;
  // setParserOptionsProject: boolean;
  // testEnvironment: any;
  // compiler: any;
}

function addGbLintPlugin(tree: Tree, options: NormalizedSchema): void {
  // console.log(options);
  const { root, plugins } = readJson(tree, '.eslintrc.json') as {
    root: boolean;
    plugins: string[];
  };
  // console.log({ root, plugins });
}

function addCustomLint(tree: Tree, options: NormalizedSchema): void {
  const projectRc = joinPathFragments(options.projectRoot, '.eslintrc.json');
  const customPath = 'eslint-custom.json';
  const rc = readJson(tree, projectRc) as {
    overrides: LintOverride[];
  };
  if (!rc.overrides) {
    rc.overrides = [{ files: ['*.ts'] }];
  }
  let tso = rc.overrides.find(
    (o) => o.files.includes('*.ts') && !o.files.includes('*.js')
  );
  if (!tso) {
    tso = { files: ['*.ts', '*.tsx'] };
    rc.overrides.push(tso);
  }
  tso.extends = tso.extends ?? [];
  tso.extends.push(
    joinPathFragments(offsetFromRoot(options.projectRoot), customPath)
  );
  writeJson(tree, projectRc, rc);
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
  options: NormalizedSchema
): Promise<GeneratorCallback> {
  return await jestProjectGenerator(tree, {
    project: options.name,
    setupFile: 'none',
    supportTsx: false,
    skipSerializers: true,
    testEnvironment: 'jsdom',
    skipFormat: true,
    // compiler: options.compiler,
  });
}

function addLint(
  tree: Tree,
  options: NormalizedSchema
): Promise<GeneratorCallback> {
  addGbLintPlugin(tree, options);
  const generateLint = lintProjectGenerator(tree, {
    project: options.name,
    linter: Linter.EsLint,
    skipFormat: true,
    tsConfigPaths: [
      joinPathFragments(options.projectRoot, 'tsconfig.lib.json'),
    ],
    eslintFilePatterns: [`${options.projectRoot}/**/*.ts`],
    setParserOptionsProject: true,
  });
  addCustomLint(tree, options);
  return generateLint;
}

function normalizeOptions(
  tree: Tree,
  options: ExtensionGeneratorSchema
): NormalizedSchema {
  const name = names(options.name).fileName;
  const projectDirectory = options.directory
    ? `${names(options.directory).fileName}/${name}`
    : name;
  const projectName = projectDirectory.replace(new RegExp('/', 'g'), '-');
  const projectRoot = `${getWorkspaceLayout(tree).appsDir}/${projectDirectory}`;
  const parsedTags = options.tags
    ? options.tags.split(',').map((s) => s.trim())
    : [];

  // options.unitTestRunner = 'none';
  // options.linter = Linter.None;

  return {
    ...options,
    projectName,
    projectRoot,
    projectDirectory,
    parsedTags,
    // setParserOptionsProject: true,
    // testEnvironment: 'jsdom',
  };
}

function addFiles(tree: Tree, options: NormalizedSchema) {
  const templateOptions = {
    ...options,
    ...names(options.name),
    offsetFromRoot: offsetFromRoot(options.projectRoot),
    tmpl: '',
  };
  generateFiles(
    tree,
    join(__dirname, 'files'),
    options.projectRoot,
    templateOptions
  );
}

export default async function (
  tree: Tree,
  options: ExtensionGeneratorSchema
): Promise<void> {
  const normalizedOptions = normalizeOptions(tree, options);
  addProjectConfiguration(tree, normalizedOptions.projectName, {
    root: normalizedOptions.projectRoot,
    projectType: 'application',
    sourceRoot: `${normalizedOptions.projectRoot}/src`,
    targets: {
      build: {
        executor: '@gb-nx/nx-browser:build',
        outputs: ['{options.outputPath}'],
        options: {
          outputPath: `dist/${normalizedOptions.projectRoot}/extension`,
          manifest: `${normalizedOptions.projectRoot}/src/manifest`,
        },
      },
    },
    tags: normalizedOptions.parsedTags,
  });
  await initGenerator(tree, { ...normalizedOptions, skipFormat: true });
  addFiles(tree, normalizedOptions);
  await addJest(tree, normalizedOptions);
  await addLint(tree, normalizedOptions);
  await formatFiles(tree);
}
