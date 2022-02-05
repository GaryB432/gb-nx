export interface LintOverride {
  extends?: string[];
  files: string[];
}

export interface ESLintConfiguration {
  overrides: LintOverride[];
}

export function addCustomConfig(
  config: ESLintConfiguration,
  customPath: string
): ESLintConfiguration {
  if (!config.overrides) {
    config.overrides = [{ files: ['*.ts'] }];
  }
  let tso = config.overrides.find(
    (o) => o.files.includes('*.ts') && !o.files.includes('*.js')
  );
  if (!tso) {
    tso = { files: ['*.ts', '*.tsx'] };
    config.overrides.push(tso);
  }
  tso.extends = tso.extends ?? [];
  tso.extends.push(customPath);
  return config;
}
