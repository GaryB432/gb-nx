/* eslint-disable */
export default {
  displayName: 'junit',
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
  coverageDirectory: '../../coverage/packages/junit',
  reporters: [
    'default',
    [
      'jest-junit',
      {
        outputDirectory: 'junit/packages',
        outputName: 'junit.xml',
      },
    ],
  ],
};
