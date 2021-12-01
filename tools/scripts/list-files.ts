import { Workspaces } from "@nrwl/tao/src/shared/workspace";
import { readdir, readFile, stat } from "fs/promises";

// import * as fg from "fast-glob";

import fg from "fast-glob";

const ns: string[] = [];

async function doFolder(p: string): Promise<void> {
  // const dfd = await readdir(p);
  // console.log(p);
  const f = await fg("D:/Users/bort1/Documents/GitHub/gb-grocery@6.0.0/src/**", {
    ignore: [".git", "node_modules", "dist", ".angular/cache"].map((d) => `**/${d}`),
    dot: true,
  });
  for (const dfd of f) {
    console.log(dfd);
  }

  console.log(f.length);

  // for (const f of dfd) {
  //   const ss = await stat(f);
  //   console.log(f, ss.isDirectory());

  //   // if (ss.isDirectory()) {
  //   //   doFolder(f);
  //   // } else {
  //   //   ns.push(f);
  //   // }
  //   // console.log(f);
  // }
}

(async () => {
  try {
    doFolder(process.cwd());
    // const d = await readdir(process.cwd());

    // for (const f of d) {
    //   // process.stdout.write(f);
    //   const ffd = await stat(f);
    //   if (ffd.isDirectory()) {
    //   } else {
    //     console.log(f);
    //   }
    //   console.log(ffd.isDirectory());
    // }

    // console.log(d);

    // const ws = new Workspaces(process.cwd());

    // console.log(ws.isNxGenerator("./packages/nx-junit", "nx-junit"));

    // // console.log(ws.readGenerator('cccnnn', 'tbd'));

    // // console.log(ws.calculateDefaultProjectName(process.cwd(), ws.))

    // const wsConfig = ws.readWorkspaceConfiguration();
    // // console.log(wsConfig);
    // for (const k in wsConfig.projects) {
    //   console.log(
    //     k === wsConfig.defaultProject ? "*" : " ",
    //     k,
    //     wsConfig.projects[k].projectType
    //   );
    // }
  } catch (e) {
    console.error(e);
  }
})();
