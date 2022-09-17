/* eslint-disable */
/* from ./src/generators/route/schema.json */

export interface Schema {
  /**
   * The name of the route.
   */
  name: string;
  /**
   * The Svelte project to target.
   */
  project: string;
  /**
   * Directory where the generated files are placed.
   */
  directory?: string;
  /**
   * Skip formatting files.
   */
  skipFormat?: boolean;
  /**
   * Style language.
   */
  language?: 'css' | 'scss';
}
