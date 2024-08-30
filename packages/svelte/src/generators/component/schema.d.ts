/* eslint-disable */

/**
 * Svelte Component Options Schema.
 */
export interface Schema {
  /**
   * The name of the component.
   */
  name: string;
  /**
   * The Svelte project to target.
   */
  project: string;
  /**
   * Directory where the component is placed, relative to your Svelte project's source root.
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
  /**
   * Use svelte runes (requires svelte >=5)
   */
  runes?: boolean;
}
