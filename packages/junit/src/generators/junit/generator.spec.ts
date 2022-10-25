/* eslint-disable @typescript-eslint/no-non-null-assertion */
import type { TargetConfiguration, Tree } from '@nrwl/devkit';
import {
  addProjectConfiguration,
  readProjectConfiguration,
} from '@nrwl/devkit';
import { createTreeWithEmptyWorkspace } from '@nrwl/devkit/testing';
// import { projectGraphAdapter } from 'nx/src/project-graph/project-graph';
import generator from './generator';
import type { Schema as JunitGeneratorSchema } from './schema';

const jestConfigScript = `/* eslint-disable */
export default {
  displayName: 'test',
  preset: '../../jest.preset.js',
  globals: {
    'ts-jest': {
      tsconfig: '<rootDir>/tsconfig.spec.json',
    },
  },
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx'],
  coverageDirectory: '../../coverage/libs/test',
};`;

const jestConfigScriptWithReporters = `/* eslint-disable */
export default {
  displayName: 'test',
  preset: '../../jest.preset.js',
  globals: {
    'ts-jest': {
      tsconfig: '<rootDir>/tsconfig.spec.json',
    },
  },
  transform: {
    '^.+\\.[tj]sx?$': 'ts-jest',
  },
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx'],
  coverageDirectory: '../../coverage/libs/test',
  reporters: [
    'other',
    [
      'jest-party',
      {
        confetti: true,
        moar: 'clowns.xml',
      },
    ],
  ],
};`;

// const goal: JestConfig = {
//   preset: '../../jest.preset.js',
//   testEnvironment: 'node',
//   moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx'],
//   coverageDirectory: '../../coverage/apps/test',
//   reporters: [
//     'default',
//     [
//       'jest-junit',
//       {
//         outputDirectory: 'junit/libs',
//         outputName: 'test.xml',
//       },
//     ],
//     'other',
//     [
//       'jest-tbd',
//       {
//         outputDirectory: 'party/libs',
//         outputName: 'alphabetical',
//       },
//     ],
//   ],
// };

describe('junit generator', () => {
  let appTree: Tree;
  const options: JunitGeneratorSchema = {
    project: 'test',
  };

  beforeEach(() => {
    appTree = createTreeWithEmptyWorkspace();
    appTree.write(
      'package.json',
      JSON.stringify({
        name: 'fun@test',
        dependencies: { cheese: 'latest' },
        devDependencies: {},
      })
    );
    addProjectConfiguration(appTree, 'test', {
      root: 'apps/test',
      name: 'test',
      sourceRoot: 'apps/test/src',
      projectType: 'application',
      targets: {
        fun: {
          executor: '@gb-nx/hello',
          outputs: ['{options.outputFile}'],
          options: {
            sandwiches: ['classic', 'jelly'],
          },
        },
        test: {
          executor: '@nrwl/jest:jest',
          outputs: [
            'way/more/than/normal',
            'coverage/apps/test',
            'more/files/test',
            'way/more/than/normal',
          ],
          options: {
            jestConfig: 'apps/test/jest.config.ts',
          },
        },
      },
      tags: [],
    });
    appTree.write('.gitignore', 'a\nb\nc\n');
    appTree.write('apps/test/jest.config.ts', jestConfigScript);
  });

  it('should run successfully', async () => {
    await generator(appTree, options);
    const config = readProjectConfiguration(appTree, 'test');
    expect(config).toBeDefined();
  });

  it('should create files', async () => {
    await generator(appTree, options);
    const config = readProjectConfiguration(appTree, 'test');
    const target: TargetConfiguration = config.targets!['test'];
    expect(target.options!.jestConfig).toEqual('apps/test/jest.config.ts');
    const jconf = appTree.read(target.options!.jestConfig);
    expect(jconf!.toString()).toContain("outputDirectory: 'junit/apps'");
  });

  it('should add output', async () => {
    await generator(appTree, options);
    const config = readProjectConfiguration(appTree, 'test');
    const target: TargetConfiguration = config.targets!['test'];
    expect(target.options!.jestConfig).toEqual('apps/test/jest.config.ts');
    expect(target.outputs).toEqual([
      'way/more/than/normal',
      'coverage/apps/test',
      'more/files/test',
      '{workspaceRoot}/junit/apps/test.xml',
    ]);
  });

  it('should add to gitignore', async () => {
    await generator(appTree, options);
    expect(appTree.read('.gitignore')?.toString()).toContain('\n/junit\n');
  });
});
