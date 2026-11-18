import { StyleSheet, View, Image } from 'react-native';
import React, { useEffect, useRef } from 'react';
import { THEME_LIGHT } from '../colors/index';
import { Logo } from '../assets';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/types';

type SplashNavProp = NativeStackNavigationProp<RootStackParamList, 'Splash'>;

const SplashScreen = () => {
  const navigation = useNavigation<SplashNavProp>();
  const navigatedRef = useRef(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      if (!navigatedRef.current) {
        navigatedRef.current = true;
        navigation.replace('Tabs');
      }
    }, 2500);
    return () => clearTimeout(timer);
  }, []);

  return (
    <View style={styles.container}>
      <Image source={Logo} style={styles.logoImage} resizeMode="contain" />
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
