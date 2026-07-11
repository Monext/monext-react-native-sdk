const path = require('path');
const {getDefaultConfig, mergeConfig} = require('@react-native/metro-config');

const libraryRoot = path.resolve(__dirname, '..');

/**
 * Metro configuration
 * https://reactnative.dev/docs/metro
 *
 * @type {import('@react-native/metro-config').MetroConfig}
 */
const config = {
  watchFolders: [libraryRoot],
  resolver: {
    extraNodeModules: {
      'monext-react-native-sdk': libraryRoot,
      react: path.resolve(__dirname, 'node_modules/react'),
      'react-native': path.resolve(__dirname, 'node_modules/react-native'),
    },
    nodeModulesPaths: [
      path.resolve(__dirname, 'node_modules'),
      path.resolve(libraryRoot, 'node_modules'),
    ],
  },
};

module.exports = mergeConfig(getDefaultConfig(__dirname), config);
