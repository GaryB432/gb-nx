/* eslint-disable */

/**
 * Initializes the @gb-nx/cli plugin.
 */
export interface Schema {
  name: string;
  /**
   * Add tags to the project (used for linting)
   */
  tags?: string;
  /**
   * A directory where the project is placed
   */
  directory?: string;
}
