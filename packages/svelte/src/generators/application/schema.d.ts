export interface ApplicationGeneratorOptions {
  projectPath: string;
  tags?: string;
  eslint?: boolean;
  skipFormat?: boolean;
}

export interface NormalizedOptions extends ApplicationGeneratorOptions {
  projectRoot: Path;
}
