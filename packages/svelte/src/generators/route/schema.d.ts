/* eslint-disable */

/**
 * Create a route in a Svelte Kit project.
 */
export interface Schema {
  /**
   * The name of the route.
   */
  name: string;
  /**
   * The Svelte project to target.
   */
  project?: string;
  /**
   * Directory where the generated files are placed, relative to your Svelte project's source root.
   */
  directory?: string;
  /**
   * Skip formatting files.
   */
  skipFormat?: boolean;
  /**
   * Do not create 'spec' test file for the route.
   */
  skipTests?: boolean;
  /**
   * Route script language (ts/js).
   */
  language?: 'js' | 'ts';
  /**
   * Route style language (css/scss).
   */
  style?: 'css' | 'scss';
  /**
   * Source of data for your load function
   */
  load?: 'shared' | 'server' | 'none';
  /**
   * Use svelte runes (requires svelte >=5)
   */
  runes?: boolean;
}
