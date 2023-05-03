# gb-nx/junit

[![CI](https://img.shields.io/github/actions/workflow/status/GaryB432/gb-nx/main.yml?branch=master)](https://github.com/GaryB432/gb-nx/actions)
[![latest](https://img.shields.io/npm/v/@gb-nx/junit/latest.svg)](https://www.npmjs.com/package/@gb-nx/junit)

> This plugin will add [Jest Junit Reporter](https://www.npmjs.com/package/jest-junit) to your [Nx](https://nx.dev/) project.

## Prerequisite

If you have not already, [create an Nx workspace](https://github.com/nrwl/nx#creating-an-nx-workspace) with the following:

```
npx create-nx-workspace@latest
```

## Getting Started

### Install Plugin

```
# npm
npm install @gb-nx/junit --save-dev

# yarn
yarn add @gb-nx/junit --dev
```

### Add Junit reporter to your app

You will need to have an app in your workspace. You can create one with `nx g @nx/node:app my-app`.

```
nx g @gb-nx/junit:app my-app
```

## Generators (i.e. code generation)

### Application

`nx g @gb-nx/junit:app <project> [options]`

| Arguments   | Description                  |
| ----------- | ---------------------------- |
| `<project>` | The project to add junit to. |

| Options             | Default   | Description                                |
| ------------------- | --------- | ------------------------------------------ |
| `--tags`            | -         | Tags to use for linting (comma-delimited). |
| `--reporterVersion` | `^16.0.0` | The version of `junit-reporter` to use.    |
| `--skipFormat`      | `false`   | Skip formatting files.                     |

## Migrations

This plugin supports Nx migrations and provides necessary version and code updates. So instead of bumping plugin version manually in package.json it's recommended to run `nx migrate @gb-nx/junit` command, that includes bumping the version of the @gb-nx/cli plugin, related dependencies and running code migrations.

## @gb-nx/junit & Nx Compatibility Chart

| @gb-nx/junit version | Nx version |
| -------------------- | ---------- |
| ^3.0.0               | ^16.0.0    |
| <3.0.0               | ^15.0.0    |

## License

MIT
