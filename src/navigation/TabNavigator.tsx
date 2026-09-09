import React from 'react';
import { Pressable, View, Text } from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Home, ShieldCheck, Search, BadgeCheck, UserRound } from 'lucide-react-native';
import { colors, useNavColors } from '../theme/tokens';
import type { TabParamList } from './types';
import { HomeScreen } from '../screens/home/HomeScreen';
import { ReportsScreen } from '../screens/reports/ReportsScreen';
import { SearchScreen } from '../screens/search/SearchScreen';
import { GetCertifiedScreen } from '../screens/leads/GetCertifiedScreen';
import { ProfileScreen } from '../screens/profile/ProfileScreen';

const Tab = createBottomTabNavigator<TabParamList>();

function SearchTabBarButton({ onPress, accessibilityState }: any) {
  const focused = accessibilityState?.selected;
  const nav = useNavColors();
  return (
    <Pressable
      onPress={onPress}
      style={{
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <View
        style={{
          width: 46,
          height: 46,
          borderRadius: 23,
          backgroundColor: colors.brand[600],
          borderWidth: 4,
          borderColor: nav.screenBackground,
          alignItems: 'center',
          justifyContent: 'center',
          marginTop: -22,
          shadowColor: colors.brand[500],
          shadowOffset: { width: 0, height: 4 },
          shadowOpacity: 0.3,
          shadowRadius: 6,
          elevation: 5,
        }}
      >
        <Search color="#ffffff" size={18} />
      </View>
      <Text
        style={{
          fontSize: 10,
          fontWeight: '700',
          color: focused ? nav.tabActive : nav.tabInactive,
          marginTop: 2,
        }}
      >
        Search
      </Text>
    </Pressable>
  );
}

/** Bottom-tab navigator for the app's top-level sections matching the responsive website. */
export function TabNavigator() {
  const nav = useNavColors();
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: nav.tabActive,
        tabBarInactiveTintColor: nav.tabInactive,
        tabBarLabelStyle: { fontSize: 10, fontWeight: '700', marginTop: -2 },
        tabBarStyle: {
          borderTopColor: nav.border,
          backgroundColor: nav.screenBackground,
          height: 60,
          paddingBottom: 6,
          shadowColor: '#000',
          shadowOffset: { width: 0, height: -4 },
          shadowOpacity: nav.dark ? 0.3 : 0.06,
          shadowRadius: 10,
          elevation: 8,
        },
        lazy: true,
      }}>
      <Tab.Screen
        name="Home"
        component={HomeScreen}
        options={{ tabBarLabel: 'Home', tabBarIcon: ({ color, size }) => <Home color={color} size={size} /> }}
      />
      <Tab.Screen
        name="Reports"
        component={ReportsScreen}
        options={{ tabBarLabel: 'Products', tabBarIcon: ({ color, size }) => <ShieldCheck color={color} size={size} /> }}
      />
      <Tab.Screen
        name="Search"
        component={SearchScreen}
        options={{
          tabBarLabel: 'Search',
          tabBarButton: (props) => <SearchTabBarButton {...props} />,
        }}
      />
      <Tab.Screen
        name="GetCertified"
        component={GetCertifiedScreen}
        options={{ tabBarLabel: 'Get Certified', tabBarIcon: ({ color, size }) => <BadgeCheck color={color} size={size} /> }}
      />
      <Tab.Screen
        name="Profile"
        component={ProfileScreen}
        options={{ tabBarLabel: 'Profile', tabBarIcon: ({ color, size }) => <UserRound color={color} size={size} /> }}
      />
    </Tab.Navigator>
  );
}
