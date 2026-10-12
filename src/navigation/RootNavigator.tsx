import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useNavColors } from '../theme/tokens';
import type { RootStackParamList } from './types';
import { TabNavigator } from './TabNavigator';

import { ProductDetailScreen } from '../screens/product/ProductDetailScreen';
import { ReportDetailScreen } from '../screens/reports/ReportDetailScreen';
import { BrandDetailScreen } from '../screens/brands/BrandDetailScreen';
import { CertifiedBrandsScreen } from '../screens/brands/CertifiedBrandsScreen';
import { RankingsIndexScreen } from '../screens/rankings/RankingsIndexScreen';
import { RankingsCategoryScreen } from '../screens/rankings/RankingsCategoryScreen';
import { VerifyScreen } from '../screens/verify/VerifyScreen';
import { GetCertifiedScreen } from '../screens/leads/GetCertifiedScreen';
import { ChallengeScreen } from '../screens/leads/ChallengeScreen';
import { AboutScreen } from '../screens/content/AboutScreen';
import { TestingScreen } from '../screens/content/TestingScreen';
import { WhatGetsCertifiedScreen } from '../screens/content/WhatGetsCertifiedScreen';
import { PolicyScreen } from '../screens/content/PolicyScreen';
import { SettingsMenuScreen } from '../screens/more/SettingsMenuScreen';
import { MoreScreen } from '../screens/more/MoreScreen';
import { ShopScreen } from '../screens/shop/ShopScreen';
import { ShopSectionScreen } from '../screens/shop/ShopSectionScreen';
import { ExportDataScreen } from '../screens/profile/ExportDataScreen';
import { DeleteAccountScreen } from '../screens/profile/DeleteAccountScreen';
import { LoginScreen } from '../screens/auth/LoginScreen';
import { RegisterScreen } from '../screens/auth/RegisterScreen';
import { OtpLoginScreen } from '../screens/auth/OtpLoginScreen';
import { TwoFactorChallengeScreen } from '../screens/auth/TwoFactorChallengeScreen';
import { ForgotPasswordScreen } from '../screens/auth/ForgotPasswordScreen';
import { ResetPasswordScreen } from '../screens/auth/ResetPasswordScreen';

const Stack = createNativeStackNavigator<RootStackParamList>();

/** Root stack — bottom tabs as the base screen, every drill-down/auth screen pushed on top. See src/navigation/types.ts for the full route map. */
export function RootNavigator() {
  const nav = useNavColors();
  return (
    <Stack.Navigator
      screenOptions={{
        headerTintColor: nav.headerTint,
        headerTitleStyle: { fontWeight: '700', color: nav.headerTint },
        headerShadowVisible: false,
        headerStyle: { backgroundColor: nav.headerBackground },
        contentStyle: { backgroundColor: nav.screenBackground },
        freezeOnBlur: false,
        // Swipe-to-go-back on every pushed screen, both platforms — full-width
        // edge swipe on iOS (not just the left-edge sliver), Android gets the
        // matching gesture via react-native-screens.
        headerBackTitleVisible: false,
        headerBackTitle: '',
        gestureEnabled: true,
        fullScreenGestureEnabled: true,
        animation: 'slide_from_right',
      }}>
      <Stack.Screen name="Tabs" component={TabNavigator} options={{ headerShown: false }} />

      <Stack.Screen name="ProductDetail" component={ProductDetailScreen} options={{ title: 'Product' }} />
      <Stack.Screen name="ReportDetail" component={ReportDetailScreen} options={{ title: 'Test Report' }} />
      <Stack.Screen name="BrandDetail" component={BrandDetailScreen} options={{ title: 'Brand' }} />
      <Stack.Screen name="CertifiedBrands" component={CertifiedBrandsScreen} options={{ title: 'Certified Brands' }} />
      <Stack.Screen name="RankingsIndex" component={RankingsIndexScreen} options={{ title: 'Rankings' }} />
      <Stack.Screen name="RankingsCategory" component={RankingsCategoryScreen} options={{ title: 'Rankings' }} />
      <Stack.Screen name="Verify" component={VerifyScreen} options={{ title: 'Verify Certificate' }} />
      <Stack.Screen name="GetCertified" component={GetCertifiedScreen} options={{ title: 'Get Certified' }} />
      <Stack.Screen name="Challenge" component={ChallengeScreen} options={{ title: 'Challenge a Result' }} />
      <Stack.Screen name="About" component={AboutScreen} options={{ title: 'About Us' }} />
      <Stack.Screen name="Testing" component={TestingScreen} options={{ title: 'Gold Certification' }} />
      <Stack.Screen name="WhatGetsCertified" component={WhatGetsCertifiedScreen} options={{ title: 'What Gets Certified' }} />
      <Stack.Screen name="Policy" component={PolicyScreen} options={{ title: 'Policy' }} />
      <Stack.Screen name="SettingsMenu" component={SettingsMenuScreen} options={{ title: 'Settings' }} />
      <Stack.Screen name="ExportData" component={ExportDataScreen} options={{ title: 'Export My Data' }} />
      <Stack.Screen name="DeleteAccount" component={DeleteAccountScreen} options={{ title: 'Delete Account' }} />
      <Stack.Screen name="Shop" component={ShopScreen} options={{ title: 'Shop' }} />
      <Stack.Screen name="ShopSection" component={ShopSectionScreen} options={{ headerShown: false }} />
      <Stack.Screen name="More" component={MoreScreen} options={{ title: 'More' }} />

      <Stack.Screen name="Login" component={LoginScreen} options={{ title: 'Log in' }} />
      <Stack.Screen name="Register" component={RegisterScreen} options={{ title: 'Create account' }} />
      <Stack.Screen name="OtpLogin" component={OtpLoginScreen} options={{ title: 'Mobile OTP login' }} />
      <Stack.Screen
        name="TwoFactorChallenge"
        component={TwoFactorChallengeScreen}
        options={{ title: 'Two-factor verification' }}
      />
      <Stack.Screen name="ForgotPassword" component={ForgotPasswordScreen} options={{ title: 'Forgot password' }} />
      <Stack.Screen name="ResetPassword" component={ResetPasswordScreen} options={{ title: 'Reset password' }} />
    </Stack.Navigator>
  );
}
