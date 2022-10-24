/* eslint-disable */

/**
 * Refreshes generated CLI application assets.
 */
export interface Schema {
  /**
   * The name of the project.
   */
  project?: string;
  /**
   * Specifies if all files should be generated
   */
  all?: boolean;
  /**
   * Specifies if command typescript definitions should be generated
   */
  ts?: boolean;
  /**
   * Specifies if build target main should be generated
   */
  main?: boolean;
  /**
   * Specifies if commands.md should be generated
   */
  markdown?: boolean;
}
