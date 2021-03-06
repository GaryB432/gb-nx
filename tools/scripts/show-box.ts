import { Workspaces } from "@nrwl/devkit";

(async () => {
  const opts = { path: '.' };
  try {
    const ws = new Workspaces(process.cwd());

    console.log(ws.isNxGenerator('./packages/junit', 'junit'));

    // console.log(ws.readGenerator('cccnnn', 'tbd'));

    // console.log(ws.calculateDefaultProjectName(process.cwd(), ws.))

    const wsConfig = ws.readWorkspaceConfiguration();
    // console.log(wsConfig);
    for (const k in wsConfig.projects) {
      console.log(
        k === wsConfig.defaultProject ? '*' : ' ',
        k,
        wsConfig.projects[k].projectType
      );
    }
  } catch (e) {
    console.error(e);
  }
})();
