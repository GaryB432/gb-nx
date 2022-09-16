/* eslint-disable */
/* from ./src/generators/dependency/schema.json */

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
   * The scope to prepend to the dependency name for the alias name
   */
  scope?: string;
}
