# @gb-nx/browser

This library was generated with [Nx](https://nx.dev).

[![CI](https://img.shields.io/github/actions/workflow/status/GaryB432/gb-nx/main.yml?branch=master)](https://github.com/GaryB432/gb-nx/actions)
[![npm version](https://img.shields.io/npm/v/@gb-nx/browser?style=flat-square)](https://www.npmjs.com/package/@gb-nx/browser)

> Nx Plugin adding first class support for [Manifest V3](https://developer.chrome.com/docs/extensions/mv3/intro/) Browser Extension applications in your Nx workspace

## Features

Here is a list of some of the coolest features of the plugin:

- ✅ Generation of browser extensions applications
- ✅ Building, testing, etc your extension projects
- ✅ Packaging your extension projects for web stores

## Prerequisite

If you have not already, [create an Nx workspace](https://github.com/nrwl/nx#creating-an-nx-workspace) with the following:

```
# npm
npx create-nx-workspace@latest

# yarn
yarn create nx-workspace@latest
```

## Getting Started

Then you need to install the plugin in order to generate extension applications later on.

### Installing Plugin

```
# npm
npm install @gb-nx/browser --save-dev

# yarn
yarn add @gb-nx/browser --dev
```

```
npx nx build extension -c=production
npx nx build-scripts extension
```

### Generating Project

Simply run the `extension` generator with the following command:

```
nx generate @gb-nx/browser:extension --name=my-extension --directory=apps/my-extension --projectNameAndRootFormat=as-provided
```

### Working with your Project

> nx run my-extension:build

> nx run my-extension:build-scripts

Load (or reload) the unpacked extension from `dist/apps/my-extension` with `Manage Extensions` in your browser.

Refresh a browser page

Observe changes

Make changes to `my-extension\src`

Repeat

### Packaging your Project for Store Distribution

Run the `zip` target to create a versioned archive of your extension.

> npx nx zip extension --tagGit false

## Migrations

This plugin supports Nx migrations and provides necessary version and code updates. So instead of bumping plugin version manually in package.json it's recommended to run `nx migrate @gb-nx/browser` command, that includes bumping the version of the @gb-nx/browser plugin, related dependencies and running code migrations.

## @gb-nx/browser & Nx Compatibility Chart

| @gb-nx/browser version | Nx version |
| ---------------------- | ---------- |
| ^8.0.0                 | ^18.0.0    |
| ^6.0.0                 | ^17.0.0    |
| ^5.0.0                 | ^16.0.0    |
| <5.0.0                 | ^15.0.0    |

### Useful resources

- [Developer Dashboard](https://chrome.google.com/webstore/developer/dashboard)
- [Chrome Web Store - Chrome Developers](https://developer.chrome.com/docs/webstore/?hl=en)
- [Chrome Web Store - Extensions](https://chrome.google.com/webstore/category/extensions)
- [Resize a PNG - Online PNG Maker](https://onlinepngtools.com/resize-png)

## License

MIT
