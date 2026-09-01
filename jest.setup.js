/* eslint-disable @typescript-eslint/no-var-requires */
import '@testing-library/react-native/extend-expect';

jest.mock('react-native-keychain', () => ({
  setGenericPassword: jest.fn(() => Promise.resolve(true)),
  getGenericPassword: jest.fn(() => Promise.resolve(false)),
  resetGenericPassword: jest.fn(() => Promise.resolve(true)),
}));

jest.mock('react-native-config', () => ({
  API_URL: 'http://127.0.0.1:8000/api/v1',
  API_ORIGIN: 'http://127.0.0.1:8000',
  ENV_NAME: 'test',
}));

jest.mock('@react-native-firebase/messaging', () => () => ({
  requestPermission: jest.fn(() => Promise.resolve(1)),
  getToken: jest.fn(() => Promise.resolve('mock-fcm-token')),
  onTokenRefresh: jest.fn(() => () => undefined),
  onMessage: jest.fn(() => () => undefined),
  setBackgroundMessageHandler: jest.fn(),
  getInitialNotification: jest.fn(() => Promise.resolve(null)),
  onNotificationOpenedApp: jest.fn(() => () => undefined),
}));
