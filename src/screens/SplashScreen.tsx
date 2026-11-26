import React, { useCallback, useEffect, useRef, useState } from 'react';
import { Image, StatusBar, StyleSheet, useWindowDimensions, View } from 'react-native';
import Video, { type OnLoadData } from 'react-native-video';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { THEME_LIGHT } from '../colors/index';
import { Logo, SplashVideo } from '../assets';
import { RootStackParamList } from '../navigation/types';
import { prefetchBootData, prefetchSecondaryTabsData } from '../api/prefetch';

type SplashNavProp = NativeStackNavigationProp<RootStackParamList, 'Splash'>;

const INITIAL_FALLBACK_MS = 7000;
const ERROR_FALLBACK_MS = 800;

const SplashScreen = () => {
  const navigation = useNavigation<SplashNavProp>();
  const { width, height } = useWindowDimensions();
  const navigatedRef = useRef(false);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [videoError, setVideoError] = useState(false);

  const aspectRatio = height > 0 ? width / height : 0.5;
  const resizeMode = aspectRatio <= 0.65 ? 'cover' : 'contain';

  const clearFallbackTimer = useCallback(() => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
  }, []);

  const goToApp = useCallback(() => {
    if (navigatedRef.current) return;
    navigatedRef.current = true;
    clearFallbackTimer();
    navigation.replace('Tabs');
  }, [clearFallbackTimer, navigation]);

  useEffect(() => {
    // Warm Shop sections, banners, brands & primary thumbnails immediately while the intro plays.
    prefetchBootData();
    const secondaryTimer = setTimeout(() => {
      prefetchSecondaryTabsData();
    }, 600);

    timerRef.current = setTimeout(goToApp, INITIAL_FALLBACK_MS);

    return () => {
      clearTimeout(secondaryTimer);
      clearFallbackTimer();
    };
  }, [clearFallbackTimer, goToApp]);

  const handleLoad = useCallback(
    (data: OnLoadData) => {
      if (navigatedRef.current) return;
      const durationMs = data?.duration ? Math.ceil(data.duration * 1000) : 5100;
      const safetyMs = Math.min(Math.max(durationMs + 500, 1500), 8000);
      clearFallbackTimer();
      timerRef.current = setTimeout(goToApp, safetyMs);
    },
    [clearFallbackTimer, goToApp],
  );

  const handleError = useCallback(() => {
    setVideoError(true);
    clearFallbackTimer();
    timerRef.current = setTimeout(goToApp, ERROR_FALLBACK_MS);
  }, [clearFallbackTimer, goToApp]);

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={THEME_LIGHT} />
      {videoError ? (
        <Image source={Logo} style={styles.logoImage} resizeMode="contain" />
      ) : (
        <Video
          source={SplashVideo}
          style={StyleSheet.absoluteFill}
          resizeMode={resizeMode}
          muted
          repeat={false}
          controls={false}
          paused={false}
          playInBackground={false}
          playWhenInactive
          mixWithOthers="mix"
          ignoreSilentSwitch="obey"
          disableAudioSessionManagement
          disableFocus
          hideShutterView
          shutterColor={THEME_LIGHT}
          preventsDisplaySleepDuringVideoPlayback={false}
          onLoad={handleLoad}
          onEnd={goToApp}
          onError={handleError}
        />
      )}
    </View>
  );
};

export default SplashScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: THEME_LIGHT,
    justifyContent: 'center',
    alignItems: 'center',
  },
  logoImage: {
    width: 220,
    height: 220,
  },
});
