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
   * Component script language (ts/js).
   */
  language?: 'js' | 'ts';
  /**
   * Component style language (css/scss).
   */
  style?: 'css' | 'scss';
}
