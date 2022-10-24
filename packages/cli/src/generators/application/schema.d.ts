/* eslint-disable */

/**
 * Create a CLI application in your Nx workspace
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
  [k: string]: unknown | undefined;
}
