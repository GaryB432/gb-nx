/* eslint-disable */

/**
 * Create a value or class module for a project.
 */
export interface Schema {
  /**
   * The name of the module.
   */
  name: string;
  /**
   * The project to target.
   */
  project: string;
  /**
   * Skip formatting files.
   */
  skipFormat?: boolean;
  /**
   * The directory to create the module, relative to your project source.
   */
  directory?: string;
  /**
   * The kind of module.
   */
  kind?: 'class' | 'values';
  /**
   * Test runner to use for unit tests.
   */
  unitTestRunner?: 'jest' | 'vitest' | 'none';
}
