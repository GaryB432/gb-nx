/* eslint-disable */
export default {
  displayName: 'svelte',
  preset: '../../jest.preset.js',
  globals: {
    'ts-jest': {
      tsconfig: '<rootDir>/tsconfig.spec.json',
    },
  },
  testEnvironment: 'node',
  transform: {
    '^.+\\.[tj]sx?$': 'ts-jest',
  },
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx'],
  coverageDirectory: '../../coverage/packages/svelte',
  reporters: [
    'default',
    [
      'jest-junit',
      {
        outputDirectory: 'junit/packages',
        outputName: 'svelte.xml',
      },
    ],
  ],
};
