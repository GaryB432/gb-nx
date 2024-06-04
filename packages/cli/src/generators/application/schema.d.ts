/* eslint-disable */

/**
 * Create a CLI application in your Nx workspace
 */
export interface Schema {
  /**
   * The name of the application.
   */
  name: string;
  /**
   * The directory of the new application.
   */
  directory?: string;
  /**
   * Skip formatting files.
   */
  skipFormat?: boolean;
  /**
   * Do not add dependencies to `package.json`.
   */
  skipPackageJson?: boolean;
  /**
   * Create node application at the root of the workspace
   */
  rootProject?: boolean;
  /**
   * The tool to use for running lint checks.
   */
  linter?: 'eslint' | 'none';
  /**
   * Test runner to use for unit tests.
   */
  unitTestRunner?: 'jest' | 'none';
  /**
   * Add tags to the application (used for linting).
   */
  tags?: string;
  /**
   * Whether or not to configure the ESLint `parserOptions.project` option. We do not do this by default for lint performance reasons.
   */
  setParserOptionsProject?: boolean;
  /**
   * Adds strictNullChecks, noImplicitAny, strictBindCallApply, forceConsistentCasingInFileNames and noFallthroughCasesInSwitch to tsconfig.
   */
  strict?: boolean;
}
