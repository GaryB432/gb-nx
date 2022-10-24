/* eslint-disable */

export interface Schema {
  /**
   * The name of the extension manifest.
   */
  manifest?: string;
  /**
   * The output path of the generated files.
   */
  outputPath?: string;
  /**
   * Enable re-building when files change.
   */
  watch?: boolean;
  [k: string]: unknown | undefined;
}
