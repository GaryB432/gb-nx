# @gb-nx/cli

This library was generated with [Nx](https://nx.dev).

[![CI](https://img.shields.io/github/actions/workflow/status/GaryB432/gb-nx/main.yml?branch=master)](https://github.com/GaryB432/gb-nx/actions)
[![npm version](https://img.shields.io/npm/v/@gb-nx/cli?style=flat-square)](https://www.npmjs.com/package/@gb-nx/cli)

> Nx Plugin adding command line applications in your Nx workspace

## Features

Here is a list of some of the coolest features of the plugin:

- ✅ Generation of command line applications
- ✅ You work with the commands and the plugin manages boilerplate
- ✅ Building, testing, etc your projects

## Prerequisite

If you have not already, [create an Nx workspace](https://github.com/nrwl/nx#creating-an-nx-workspace) with the following:

```
# npm
npx create-nx-workspace@latest

# yarn
yarn create nx-workspace@latest
```

## Getting Started

Then you need to install the plugin in order to generate cli applications later on.

### Installing Plugin

```
# npm
npm install @gb-nx/cli --save-dev

# yarn
yarn add @gb-nx/cli --dev
```

### Generating Project

Simply run the `application` generator with the following command:

```
nx g @gb-nx/cli:application my-app
```

### Working with your Project

> nx build my-app

Add a command to the project with the `command` generator

```
nx g @gb-nx/cli:command <name> --project my-app
```

See `nx g @gb-nx/cli:command --help` for examples with command parameters and options.

**You'll want to edit the generated `cli.config.json` file to document your command. The values from the config file are used to generate the boilerplate for your project.**

The `refresh` generator refreshes your project's boilerplate. See the options below. Run this command when you change your `cli.config.json` file.

```
nx g @gb-nx/cli:refresh --project my-app --main --ts --markdown --all
```

or

```
nx sync my-app
```

| OPTION       | DESCRIPTION                                          |
| ------------ | ---------------------------------------------------- |
| `--main`     | generate the build target main entry point           |
| `--markdown` | generate the `commands.md` file in your project root |
| `--ts`       | generate the typing files for your commands          |
| `--all`      | generate all the things                              |

### About `nx serve`

The `nx serve` command will run the application with no options or parameters resulting in the message `ERROR No command specified`. To use `nx serve`, temporarily edit your `main.ts` to bypass the argv parsing and run the command you want.

Of course, you want to revert such changes before building and distributing your multi-command CLI.

Alternatively, use a command like the following

```
nx build your-app;node dist/apps/your-app/main.js your-command your-parameter
```

If your CLI has only one command, consider using the plain [@nx/node:application generator](https://nx.dev/packages/node/generators/application)

## Migrations

This plugin supports Nx migrations and provides necessary version and code updates. So instead of bumping plugin version manually in package.json it's recommended to run `nx migrate @gb-nx/cli` command, that includes bumping the version of the @gb-nx/cli plugin, related dependencies and running code migrations.

## @gb-nx/cli & Nx Compatibility Chart

| @gb-nx/cli version | Nx version |
| ------------------ | ---------- |
| ^3.0.0             | ^16.0.0    |
| <3.0.0             | ^15.0.0    |

## License

MIT
