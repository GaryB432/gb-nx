import { Workspaces } from '@nx/devkit';

(async () => {
  const opts = { path: '.' };
  try {
    // TODO deprecations throughout
    const ws = new Workspaces(process.cwd());

    // console.log(ws.isNxGenerator('./packages/junit', 'junit'));

    // const defaultProject = ws.calculateDefaultProjectName(
    //   process.cwd(),
    //   ws.readProjectsConfig(),
    //   ws.readNxJson()
    // );

    const { projects } = ws.readWorkspaceConfiguration();
    //  const dp = ws.calculateDefaultProjectName(process.cwd(), {projects}, ws.readNxJson())

    // console.log(projects);

    // const wsConfig = ws.readProjectsConfig();

    for (const k in projects) {
      console.log(
        // k === defaultProject ? '*' : ' ',
        k,
        projects[k].projectType
      );
    }
  } catch (e) {
    console.error(e);
  }
})();
