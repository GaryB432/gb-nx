/* eslint-disable */
/* from ./src/generators/module/schema.json */

/**
 * Module Options Schema.
 */
export interface Schema {
  /**
   * The name of the module.
   */
  name: string;
  /**
   * The project to target.
   */
  project: string;
  /**
   * Skip formatting files.
   */
  skipFormat?: boolean;
  /**
   * The directory to create the module, relative to your project source.
   */
  directory?: string;
  /**
   * The kind of module.
   */
  kind?: 'class' | 'values';
  /**
   * Do not create "spec.ts" test files for the new module.
   */
  skipTests?: boolean;
}
