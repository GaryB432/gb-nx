/* eslint-disable */

export interface Schema {
  /**
   * Adds the specified unit test runner
   */
  unitTestRunner?: 'jest' | 'none';
  /**
   * Skip formatting files
   */
  skipFormat?: boolean;
  [k: string]: unknown | undefined;
}
