const path = require('path');
const {getDefaultConfig, mergeConfig} = require('@react-native/metro-config');

const libraryRoot = path.resolve(__dirname, '..');
const pkg = require('../package.json');

const escapeRegExp = (str) => str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

const peerDeps = Object.keys(pkg.peerDependencies || {});

/**
 * Metro configuration
 * https://reactnative.dev/docs/metro
 *
 * @type {import('@react-native/metro-config').MetroConfig}
 */
const config = {
  watchFolders: [libraryRoot],
  resolver: {
    blockList: peerDeps.map(
      dep => new RegExp(`^${escapeRegExp(path.resolve(libraryRoot, 'node_modules', dep))}(?:/.*)?$`)
    ),
    extraNodeModules: {
      'monext-react-native-sdk': libraryRoot,
      ...peerDeps.reduce((acc, name) => {
        acc[name] = path.resolve(__dirname, 'node_modules', name);
        return acc;
      }, {}),
    },
    nodeModulesPaths: [
      path.resolve(__dirname, 'node_modules'),
    ],
    resolveRequest: (context, moduleName, platform) => {
      if (
        peerDeps.includes(moduleName) ||
        peerDeps.some(dep => moduleName.startsWith(dep + '/'))
      ) {
        return context.resolveRequest(
          {
            ...context,
            originModulePath: path.resolve(__dirname, 'package.json'),
          },
          moduleName,
          platform,
        );
      }
      return context.resolveRequest(context, moduleName, platform);
    },
  },
};

module.exports = mergeConfig(getDefaultConfig(__dirname), config);
