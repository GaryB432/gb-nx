import type { ProjectConfiguration, Tree } from '@nrwl/devkit';
import {
  formatFiles,
  getProjects,
  joinPathFragments,
  offsetFromRoot,
  output,
  readWorkspaceConfiguration,
  updateProjectConfiguration,
} from '@nrwl/devkit';
import { makeAliasName } from '../../utils/paths';
import { getSvelteConfig } from '../../utils/svelte';
import type { Alias } from './alias';
import { addToSvelteConfiguration, getConfiguredAliases } from './alias';
import type { Schema as DependencyGeneratorSchema } from './schema';

function updateSvelteConfig(
  tree: Tree,
  project: ProjectConfiguration,
  alias: Alias
): void {
  const fname = joinPathFragments(project.root, 'svelte.config.js');
  const config = tree.read(fname);
  if (!config) {
    return;
  }
  tree.write(fname, addToSvelteConfiguration(config.toString(), alias));
}

export default async function (
  tree: Tree,
  schema: DependencyGeneratorSchema
): Promise<void> {
  const notfound = (p: string) => `project '${p}' was not found in workspace`;
  const notSvelte = (p: string) =>
    `project '${p}' is not configured for svelte`;
  const ws = readWorkspaceConfiguration(tree);
  const projName = schema.project ?? ws.defaultProject;
  const aliasScope = schema.scope ?? ws.npmScope;

  const projects = getProjects(tree);
  const project = projects.get(projName);

  if (!project) {
    throw new Error(notfound(projName));
  }

  const dep = projects.get(schema.dependency);
  if (!dep) {
    throw new Error(notfound(schema.dependency));
  }

  const psrc = project.sourceRoot;
  const dsrc = dep.sourceRoot;

  const config = getSvelteConfig(tree, project);

  if (!config) {
    throw new Error(notSvelte(projName));
  }

  const aliases = getConfiguredAliases(config).slice(0);
  const depName = makeAliasName(schema.dependency, aliasScope);

  if (dsrc && psrc) {
    const path = joinPathFragments(offsetFromRoot(dep.root), dsrc);

    const aliasToAdd = { name: depName, path };
    aliases.push(aliasToAdd);

    output.log({
      title: 'Configured Aliases',
      bodyLines: aliases.map(
        (p) =>
          `${output.colors.white(p.name)}: "${output.colors.green(p.path)}"`
      ),
    });

    updateSvelteConfig(tree, project, aliasToAdd);
  }

  project.implicitDependencies = project.implicitDependencies ?? [];
  if (!project.implicitDependencies.includes(schema.dependency)) {
    project.implicitDependencies.push(schema.dependency);
    updateProjectConfiguration(tree, projName, project);
  }
  await formatFiles(tree);
}
