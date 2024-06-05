import { retrieveProjectConfigurations } from 'nx/src/project-graph/utils/retrieve-workspace-files';

async function main() {
  try {
    const { projects } = await retrieveProjectConfigurations(process.cwd(), {});

    for (const [name, project] of Object.entries(projects)) {
      console.log(name, project.projectType, project.root);
    }
  } catch (e) {
    console.error(e);
  }
}

main();
