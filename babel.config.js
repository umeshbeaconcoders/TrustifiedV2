function customNativewindBabel() {
  const config = require('nativewind/babel')();
  config.plugins = config.plugins.map((plugin) =>
    plugin === 'react-native-worklets/plugin' ? 'react-native-worklets-core/plugin' : plugin
  );
  return config;
}

module.exports = {
  presets: ['module:@react-native/babel-preset', customNativewindBabel],
  plugins: [
    [
      'module-resolver',
      {
        root: ['./src'],
        alias: { '@': './src' },
      },
    ],
    // react-native-reanimated's plugin MUST be listed last.
    'react-native-reanimated/plugin',
  ],
};
