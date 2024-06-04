/* eslint-disable */

/**
 * Create zip archive of extension app for publishing
 */
export interface Schema {
  /**
   * Name of the zip output file. Defaults to versioned archive name in the zip folder.
   */
  outputFileName?: string;
  /**
   * Tag the current branch with the extension version
   */
  tagGit?: boolean;
}
