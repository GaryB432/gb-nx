/* eslint-disable */

/**
 * Generate a CLI command.
 */
export interface Schema {
  /**
   * The name of the project.
   */
  project?: string;
  /**
   * The name of the command.
   */
  name: string;
  /**
   * Do not create "spec.ts" test files.
   */
  skipTests?: boolean;
  /**
   * Skip formatting files.
   */
  skipFormat?: boolean;
  /**
   * Parameters for the command
   */
  parameter?: string[];
  /**
   * Options for the command
   */
  option?: string[];
}
