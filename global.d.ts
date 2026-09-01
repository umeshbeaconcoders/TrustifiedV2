/// <reference types="nativewind/types" />

declare module 'react-native-config' {
  export interface NativeConfig {
    API_URL: string;
    API_ORIGIN: string;
    ENV_NAME: string;
  }
  export const Config: NativeConfig;
  export default Config;
}
