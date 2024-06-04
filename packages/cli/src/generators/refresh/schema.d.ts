/* eslint-disable */

/**
 * Refresh generated CLI application assets.
 */
export interface Schema {
  /**
   * The name of the project.
   */
  project: string;
  /**
   * Skip formatting files.
   */
  skipFormat?: boolean;
  /**
   * Generate all files
   */
  all?: boolean;
  /**
   * Generate command typescript definitions
   */
  ts?: boolean;
  /**
   * Generate build target main
   */
  main?: boolean;
  /**
   * Generate commands.md
   */
  markdown?: boolean;
}
