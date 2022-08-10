/* eslint-disable */
/* from ./src/generators/extension/schema.json */

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
   * Skip spec files
   */
  skipTests?: boolean;
  /**
   * Test runner to use for unit tests
   */
  unitTestRunner?: 'jest' | 'none';
  /**
   * Add tags to the application (used for linting)
   */
  tags?: string;
  /**
   * Whether or not to configure the ESLint "parserOptions.project" option. We do not do this by default for lint performance reasons.
   */
  setParserOptionsProject?: boolean;
  [k: string]: unknown | undefined;
}
