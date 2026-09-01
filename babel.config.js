module.exports = {
  presets: ['module:@react-native/babel-preset', 'nativewind/babel'],
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
