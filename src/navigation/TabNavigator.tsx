import React from 'react';
import { Pressable, View, Text, Platform } from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Home, ShieldCheck, Search, ShoppingBag, UserRound } from 'lucide-react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { colors, useNavColors } from '../theme/tokens';
import type { TabParamList } from './types';
import { HomeScreen } from '../screens/home/HomeScreen';
import { ReportsScreen } from '../screens/reports/ReportsScreen';
import { SearchScreen } from '../screens/search/SearchScreen';
import { ShopScreen } from '../screens/shop/ShopScreen';
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
        justifyContent: 'flex-start',
        paddingTop: 0,
      }}
    >
      <View
        style={{
          width: 44,
          height: 44,
          borderRadius: 22,
          backgroundColor: colors.brand[600],
          borderWidth: 3.5,
          borderColor: nav.screenBackground,
          alignItems: 'center',
          justifyContent: 'center',
          marginTop: -16,
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
  const insets = useSafeAreaInsets();
  // Safe bottom padding: On iPhones with home indicator, insets.bottom is typically 34.
  // On older iPhones (SE, 8) with home button, insets.bottom is 0.
  const hasHomeIndicator = insets.bottom > 0;
  const bottomPadding = hasHomeIndicator ? insets.bottom : (Platform.OS === 'ios' ? 8 : 10);
  const tabHeight = (Platform.OS === 'ios' ? 52 : 56) + bottomPadding;

  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: nav.tabActive,
        tabBarInactiveTintColor: nav.tabInactive,
        tabBarLabelStyle: { fontSize: 10, fontWeight: '700', marginBottom: hasHomeIndicator ? 0 : 4 },
        tabBarStyle: {
          borderTopColor: nav.border,
          backgroundColor: nav.screenBackground,
          height: tabHeight,
          paddingBottom: bottomPadding,
          paddingTop: 6,
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
        listeners={({ navigation }) => ({
          tabPress: () => navigation.setParams({ fromDrawer: undefined }),
        })}
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
        name="ShopTab"
        component={ShopScreen}
        options={{
          tabBarLabel: 'Shop',
          tabBarIcon: ({ color, size }) => <ShoppingBag color={color} size={size} />,
        }}
      />
      <Tab.Screen
        name="Profile"
        component={ProfileScreen}
        options={{ tabBarLabel: 'Profile', tabBarIcon: ({ color, size }) => <UserRound color={color} size={size} /> }}
      />
    </Tab.Navigator>
  );
}
