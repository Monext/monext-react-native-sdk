const path = require('path');
const {getDefaultConfig, mergeConfig} = require('@react-native/metro-config');

const libraryRoot = path.resolve(__dirname, '..');

function escapeRegExp(string) {
  return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

/**
 * Metro configuration
 * https://reactnative.dev/docs/metro
 *
 * @type {import('@react-native/metro-config').MetroConfig}
 */
const config = {
  watchFolders: [libraryRoot],
  resolver: {
    blockList: [
      new RegExp('^' + escapeRegExp(path.resolve(libraryRoot, 'node_modules/react')) + '/.*'),
      new RegExp('^' + escapeRegExp(path.resolve(libraryRoot, 'node_modules/react-native')) + '/.*'),
    ],
    extraNodeModules: {
      'monext-react-native-sdk': libraryRoot,
      react: path.resolve(__dirname, 'node_modules/react'),
      'react-native': path.resolve(__dirname, 'node_modules/react-native'),
    },
    nodeModulesPaths: [
      path.resolve(__dirname, 'node_modules'),
    ],
    resolveRequest: (context, moduleName, platform) => {
      if (moduleName === 'react' || moduleName === 'react-native') {
        return context.resolveRequest(
          context,
          path.resolve(__dirname, 'node_modules', moduleName),
          platform,
        );
      }
      return context.resolveRequest(context, moduleName, platform);
    },
  },
};

module.exports = mergeConfig(getDefaultConfig(__dirname), config);

