/* eslint-disable */

/**
 * Initialize the @gb-nx/workspace plugin.
 */
export interface Schema {
  /**
   * Skip formatting files.
   */
  skipFormat?: boolean;
  [k: string]: unknown | undefined;
}
