/* eslint-disable */

/**
 * Create a browser extension application.
 */
export interface Schema {
  /**
   * The name of the extension.
   */
  name: string;
  /**
   * The directory of the new application.
   */
  directory?: string;
  /**
   * Skip formatting files
   */
  skipFormat?: boolean;
  /**
   * The tool to use for running lint checks.
   */
  linter?: 'eslint' | 'none';
  /**
   * Test runner to use for unit tests
   */
  unitTestRunner?: 'jest' | 'none';
  /**
   * Whether to enable tsconfig strict mode or not.
   */
  strict?: boolean;
  /**
   * Create node application at the root of the workspace
   */
  rootProject?: boolean;
  /**
   * Add tags to the application (used for linting)
   */
  tags?: string;
  /**
   * Whether or not to configure the ESLint "parserOptions.project" option. We do not do this by default for lint performance reasons.
   */
  setParserOptionsProject?: boolean;
}
