const path = require('path');

module.exports = {
  assets: ['./src/assets/fonts'],
  dependencies: {
    'react-native-code-push': {
      platforms: {
        android: {
          sourceDir: path.join(__dirname, 'node_modules/react-native-code-push/android/app'),
        },
      },
    },
  },
};
