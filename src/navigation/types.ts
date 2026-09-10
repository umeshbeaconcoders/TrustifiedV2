import type { NavigatorScreenParams } from '@react-navigation/native';

export type TabParamList = {
  Home: { openDrawer?: boolean } | undefined;
  Reports: { category?: string; fromDrawer?: boolean } | undefined;
  Search: undefined;
  BrandsTab: { fromDrawer?: boolean } | undefined;
  Profile: undefined;
};

/**
 * Single flat root stack hosting the bottom-tab navigator plus every
 * drill-down/auth screen. Tab screens can still `navigation.navigate(...)`
 * into these because React Navigation bubbles unresolved route names up to
 * the parent navigator — this keeps the tree simple (per Section 0's
 * "tabs for top-level sections, stack for drill-down" rule) without a deep
 * nested-stack-per-tab setup that the budget for this pass doesn't need.
 */
export type RootStackParamList = {
  Tabs: NavigatorScreenParams<TabParamList>;
  ProductDetail: { slug: string };
  ReportDetail: { slug: string; reportId?: number };
  BrandDetail: { slug: string };
  CertifiedBrands: undefined;
  RankingsIndex: undefined;
  RankingsCategory: { slug: string };
  Verify: { certificateNumber?: string } | undefined;
  GetCertified: undefined;
  Challenge: undefined;
  About: undefined;
  Testing: undefined;
  WhatGetsCertified: undefined;
  Policy: { slug: string; title?: string };
  SettingsMenu: undefined;
  ExportData: undefined;
  DeleteAccount: undefined;
  Login: { redirectTo?: keyof RootStackParamList } | undefined;
  Register: undefined;
  OtpLogin: undefined;
  TwoFactorChallenge: { challengeToken: string };
  ForgotPassword: undefined;
  ResetPassword: { token?: string; email?: string } | undefined;
  Shop: undefined;
  More: undefined;
};

declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace ReactNavigation {
    interface RootParamList extends RootStackParamList {}
  }
}
