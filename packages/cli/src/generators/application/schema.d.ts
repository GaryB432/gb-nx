/* eslint-disable */

/**
 * Create a CLI application in your Nx workspace
 */
export interface Schema {
  /**
   * The name of your application
   */
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
