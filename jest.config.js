module.exports = {
  preset: 'react-native',
  setupFilesAfterEach: [],
  setupFiles: ['./jest.setup.js'],
  transformIgnorePatterns: [
    'node_modules/(?!(react-native|@react-native|@react-navigation|@shopify/flash-list|moti|react-native-reanimated|react-native-fast-image|@gorhom/bottom-sheet)/)',
  ],
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1',
  },
};
