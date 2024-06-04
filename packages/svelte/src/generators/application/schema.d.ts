/* eslint-disable */

/**
 * Add NX configuration to your Svelte-kit package.
 */
export interface Schema {
  /**
   * Path to the Sveltekit project.
   */
  projectPath: string;
  /**
   * Add tags to the project (used for linting)
   */
  tags?: string;
  /**
   * Update workspace eslint to accomodate Svelte linting
   */
  eslint?: boolean;
  /**
   * Skip formatting files.
   */
  skipFormat?: boolean;
}
