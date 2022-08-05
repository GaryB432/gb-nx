/* eslint-disable */
/* from ./src/generators/junit/schema.json */

export interface Schema {
  /**
   * The project to add junit to
   */
  projectName?: string;
  /**
   * Version of jest-junit to use
   */
  reporterVersion?: string;
  [k: string]: unknown;
}
