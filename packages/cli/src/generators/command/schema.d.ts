export interface Schema {
  project?: string;
  name: string;
  skipFormat?: boolean;
  skipTests?: boolean;
  parameter?: string[];
  option?: string[];
}
