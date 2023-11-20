export interface Schema {
  directory?: string;
  export?: boolean;
  name: string;
  option?: string[];
  parameter?: string[];
  skipFormat?: boolean;
  skipTests?: boolean;
}

export interface NormalizedSchema extends Schema {
  directory: string;
  fileName: string;
  filePath: string;
  projectName: string;
  projectRoot: string;
  projectSourceRoot: string;
}
