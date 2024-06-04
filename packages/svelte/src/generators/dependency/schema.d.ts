/* eslint-disable */

/**
 * Add an implicit dependency to a Svelte Kit package.
 */
export interface Schema {
  /**
   * The project to add the dependency src to
   */
  project: string;
  /**
   * The dependent project to add
   */
  dependency: string;
  /**
   * The scope to prepend to the dependency name for the alias name (without the @)
   */
  scope?: string;
  /**
   * Skip formatting files.
   */
  skipFormat?: boolean;
}
