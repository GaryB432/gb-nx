import { Workspaces } from '@nx/devkit';

(async () => {
  const opts = { path: '.' };
  try {
    const ws = new Workspaces(process.cwd());

    console.log(ws.isNxGenerator('./packages/junit', 'junit'));

    const defaultProject = ws.calculateDefaultProjectName(
      process.cwd(),
      ws.readProjectsConfig(),
      ws.readNxJson()
    );

    const wsConfig = ws.readProjectsConfig();

    for (const k in wsConfig.projects) {
      console.log(
        k === defaultProject ? '*' : ' ',
        k,
        wsConfig.projects[k].projectType
      );
    }
  } catch (e) {
    console.error(e);
  }
})();
