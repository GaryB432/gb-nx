/* eslint-disable */

/**
 * Generate a CLI command.
 */
export interface Schema {
  /**
   * The path at which to create the command file, relative to the current workspace. Default is a folder with the same name as the pipe in the project root.
   */
  path?: string;
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
   * Create the new files at the top level of the current project.
   */
  flat?: boolean;
  /**
   * Specifies if the command should be exported from the project's entry point
   */
  export?: boolean;
  /**
   * Parameters for the command
   */
  parameter?: string[];
  /**
   * Options for the command
   */
  option?: string[];
}
