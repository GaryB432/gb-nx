import { BuildExecutorContext } from '../../src/executors/build/schema';
import { Logger } from './logger';

export const context: BuildExecutorContext = {
  root: 'drive:/gb-nx-dogfood',
  target: {
    executor: '@gb-nx/browser:build',
    outputs: ['{options.outputPath}'],
    options: {
      outputPath: 'dist/packages/build-me',
      main: 'packages/build-me/src/index.ts',
      tsConfig: 'packages/build-me/tsconfig.app.json',
      assets: ['packages/build-me/*.md'],
    },
  },
  workspace: {
    version: 2,
    projects: {
      'build-me': {
        root: 'packages/build-me',
        sourceRoot: 'packages/build-me/src',
        projectType: 'application',
        targets: {
          build: {
            executor: '@gb-nx/browser:build',
            outputs: ['{options.outputPath}'],
            options: {
              outputPath: 'dist/packages/build-me',
              main: 'packages/build-me/src/index.ts',
              tsConfig: 'packages/build-me/tsconfig.app.json',
              assets: ['packages/build-me/*.md'],
            },
          },
          echo: {
            executor: '@gb-nx/browser-extension:echo',
            outputs: ['{options.outputFile}'],
            options: {
              textToEcho: 'Hello World',
            },
          },
          lint: {
            executor: '@gb-nx/browser-extension:lint',
            outputs: ['{options.outputFile}'],
            options: {
              textToEcho: 'LINTING NOW',
            },
          },
        },
        tags: ['dogfood'],
      },
      'sample-a': {
        root: 'packages/sample-a',
        sourceRoot: 'packages/sample-a/src',
        projectType: 'application',
        targets: {
          lint: {
            executor: '@nrwl/linter:eslint',
            outputs: ['{options.outputFile}'],
            options: {
              lintFilePatterns: ['packages/sample-a/**/*.ts'],
            },
          },
        },
        tags: [],
      },
    },
    implicitDependencies: {
      'package.json': {
        dependencies: '*',
        devDependencies: '*',
      },
      '.eslintrc.json': '*',
    },
    workspaceLayout: {
      appsDir: 'packages',
      libsDir: 'packages',
    },
    // extends: '@nrwl/workspace/presets/core.json',
    npmScope: 'gb-nx-dogfood',
    cli: {
      defaultCollection: '@nrwl/workspace',
    },
    tasksRunnerOptions: {
      default: {
        runner: '@nrwl/workspace/tasks-runners/default',
        options: {
          cacheableOperations: ['build', 'lint', 'test', 'e2e'],
        },
      },
    },
  },
  projectName: 'build-me',
  targetName: 'build',
  cwd: 'drive:/gb-nx-dogfood',
  isVerbose: false,
  logger: new Logger(),
};
