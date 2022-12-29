/* eslint-disable */

/**
 * Add NX configuration to your Svelte-kit package.
 */
export interface Schema {
  name: string;
  /**
   * Add tags to the project (used for linting)
   */
  tags?: string;
  /**
   * A directory where the project is placed
   */
  directory?: string;
  /**
   * Update workspace eslint to accomodate Svelte linting
   */
  eslint?: boolean;
}
