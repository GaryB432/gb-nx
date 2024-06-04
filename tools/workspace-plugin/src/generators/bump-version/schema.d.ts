/* eslint-disable */

export interface Schema {
  /**
   * Which part to increment
   */
  part:
    | 'major'
    | 'premajor'
    | 'minor'
    | 'preminor'
    | 'patch'
    | 'prepatch'
    | 'prerelease';
  /**
   * Identifier to be used to prefix premajor, preminor, prepatch or prerelease version increments.
   */
  preid?: string;
  /**
   * Project where the package configuration is updated
   */
  project?: string;
}
