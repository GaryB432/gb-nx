# gb-nx nx-junit

> First class support for [Jest Junit Reporter](https://www.npmjs.com/package/jest-junit) in your [Nx](https://nx.dev/) workspace.

## Prerequisite

If you have not already, [create an Nx workspace](https://github.com/nrwl/nx#creating-an-nx-workspace) with the following:

```
npx create-nx-workspace@^12.0.0
```

## Getting Started

### Install Plugin

```
# npm
npm install @gb-nx/nx-junit --save-dev

# yarn
yarn add @gb-nx/nx-junit --dev
```

### Add Junit reporter to your app

```
nx g @nrwl/node:app my-app
nx g @gb-nx/nx-junit:app my-app
```

## Generators (i.e. code generation)

### Application

`nx g @gb-nx/nx-junit:app <project> [options]`

| Arguments   | Description                  |
| ----------- | ---------------------------- |
| `<project>` | The project to add junit to. |

| Options        | Default | Description                                |
| -------------- | ------- | ------------------------------------------ |
| `--tags`       | -       | Tags to use for linting (comma-delimited). |
| `--directory`  | `apps`  | A directory where the project is placed.   |
| `--skipFormat` | `false` | Skip formatting files.                     |
