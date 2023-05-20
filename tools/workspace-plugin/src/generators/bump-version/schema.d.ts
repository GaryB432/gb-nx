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
   * Project where the package configuration is updated
   */
  project?: string;
}
