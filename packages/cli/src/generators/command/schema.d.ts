export interface Schema {
  name: string;
  option?: string[];
  parameter?: string[];
  project?: string;
  skipFormat?: boolean;
  skipTests?: boolean;
}
