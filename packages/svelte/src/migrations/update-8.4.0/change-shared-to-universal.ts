import { type Tree, readNxJson, updateNxJson } from '@nx/devkit';

export default function update(host: Tree) {
  const nxConfig = readNxJson(host);

  if (!nxConfig) return;

  const { generators } = nxConfig;

  if (!generators) return;

  const routeGeneratorDefaults = generators['@gb-nx/svelte:route'];

  if (!routeGeneratorDefaults) return;

  if ((routeGeneratorDefaults.load === 'shared')) {
    routeGeneratorDefaults.load = 'universal';
  }

  updateNxJson(host, { ...nxConfig, generators });
}
