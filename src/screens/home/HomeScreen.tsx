import React, { useEffect, useRef, useState } from 'react';
import { View, Text, ScrollView, Linking, Pressable, Animated, Easing, Dimensions, RefreshControl, Platform } from 'react-native';
import { useNavigation, useRoute, type RouteProp } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import {
  ShieldCheck,
  BadgeCheck,
  PlayCircle,
  ChevronRight,
  ChevronDown,
  Activity,
  FlaskConical,
  Eye,
  FileText,
  ShoppingBag,
  Store,
  Smartphone,
  Skull,
  AlertTriangle,
  Atom,
  Flame,
  Award,
  Target,
  Megaphone,
  SearchCheck,
  Share2,
  PackageSearch,
  ClipboardList,
  ClipboardCheck,
  Droplet,
  ShieldAlert,
  Microscope,
  FileCheck2,
  Youtube,
  CheckCircle,
  Trophy,
  Beaker,
  Menu,
  X,
  Search
} from 'lucide-react-native';
import { useReports, useAllCertifiedBrands, useOffers, useYoutubeVideos, useBanners, useSettings, useCategories } from '../../api';
import { Button, Spinner, MediaFrame } from '../../components/ui';
import { ProductCard } from '../../components/ProductCard';
import { FadeIn, StaggerChildren } from '../../components/motion';
import { colors } from '../../theme/tokens';
import { TrustifiedStamp } from '../../components/icons/TrustifiedStamp';
import { CategoryIcon } from '../../components/CategoryIcon';

import { InfiniteMarquee } from '../../components/InfiniteMarquee';
import { BannerSlider } from '../../components/BannerSlider';
import { ProductRail } from '../../components/ProductRail';
import { usePullToRefresh } from '../../lib/usePullToRefresh';
import { useNavColors } from '../../theme/tokens';
import type { RootStackParamList, TabParamList } from '../../navigation/types';

// Static Data definitions mirroring web page content
const WHY_BETTER_ITEMS = [
  {
    iconName: 'ShieldCheck' as const,
    title: 'Independent & Unbiased',
    body: 'We buy every product ourselves. No free samples. No bias.',
    iconColor: '#2ab841',
    bgColor: '#eafbee',
  },
  {
    iconName: 'FlaskConical' as const,
    title: 'Blind Lab Testing',
    body: 'The exact sealed product you see is the one sent for testing. No shortcuts.',
    iconColor: '#2ab841',
    bgColor: '#eafbee',
  },
  {
    iconName: 'Eye' as const,
    title: 'Transparent from start to finish',
    body: 'From purchase to lab test to results, everything is transparent.',
    iconColor: '#2ab841',
    bgColor: '#eafbee',
  },
  {
    iconName: 'FileText' as const,
    title: 'Full Disclosure',
    body: "Unlike others, we don't hide failures. Pass or fail, every result is shared with you.",
    iconColor: '#dc2626',
    bgColor: '#fef2f2',
  },
];

const SUPPORT_MISSION_ITEMS = [
  {
    iconName: 'PackageSearch' as const,
    title: 'Shopping Smart',
    body: 'Shop verified products on our app or at our shop.',
    screen: true,
  },
  {
    iconName: 'Share2' as const,
    title: 'Spread the Word',
    body: 'Help more people make informed choices by sharing Trustified and our independent investigations with your community.',
    screen: false,
  },
  {
    iconName: 'Smartphone' as const,
    title: 'Using Our App',
    body: 'Download Trustified on iOS & Android for easy access to reports and safe shopping.',
    screen: false,
  },
];

const WHAT_WE_TEST_ITEMS = [
  {
    iconName: 'ClipboardCheck' as const,
    title: 'Label Accuracy',
    desc: 'Verifying label claims against actual contents.',
  },
  {
    iconName: 'Droplet' as const,
    title: 'Product Purity',
    desc: 'Checking for unwanted substances and adulteration.',
  },
  {
    iconName: 'ShieldAlert' as const,
    title: 'Contaminant Safety',
    desc: 'Screening for harmful contaminants.',
  },
  {
    iconName: 'FlaskConical' as const,
    title: 'Hormones & Prohibited Substances',
    desc: 'Assessing additional substances of concern.',
  },
  {
    iconName: 'Microscope' as const,
    title: 'Product-Specific Analysis',
    desc: 'Additional testing based on the product and potential risks.',
  },
];

const TESTING_STEPS = [
  {
    iconName: 'PackageSearch' as const,
    title: 'Blind Purchased',
    body: 'We independently purchase products with our own money.',
  },
  {
    iconName: 'ClipboardList' as const,
    title: 'Proof Recorded',
    body: 'We record the complete ordering process and completely uncut unboxing, including batch details.',
  },
  {
    iconName: 'Beaker' as const,
    title: 'Sent to Lab',
    body: 'A sealed unit from the products shown in our unboxing is sent to an independent laboratory for testing, with the tested batch clearly documented.',
  },
  {
    iconName: 'FileCheck2' as const,
    title: 'Results Published',
    body: 'We publish the testing results for full transparency.',
  },
];

const YOUTUBE_MEMBERSHIP_BENEFITS = [
  {
    icon: Target,
    title: 'Be Part of the Mission',
    body: 'Every membership funds blind supplement testing and fuels our mission to make health claims honest.',
  },
  {
    icon: Award,
    title: 'Get Recognized',
    body: 'Stand out with loyalty badges, custom emojis, and on-screen thank-yous that show your backing.',
  },
  {
    icon: Megaphone,
    title: 'Join the Movement for Transparency',
    body: 'Be part of a growing community working toward greater honesty, accountability, and transparency in the supplement industry.',
  },
  {
    icon: SearchCheck,
    title: 'Support Independent Investigation',
    body: 'Join a community that values independent research and evidence-based information over marketing claims.',
  },
];

function getSectionIcon(name: string, size: number = 24, color: string = '#2ab841') {
  switch (name) {
    case 'ShieldCheck': return <ShieldCheck size={size} color={color} />;
    case 'FlaskConical': return <FlaskConical size={size} color={color} />;
    case 'Eye': return <Eye size={size} color={color} />;
    case 'FileText': return <FileText size={size} color={color} />;
    case 'ShoppingBag': return <ShoppingBag size={size} color={color} />;
    case 'Store': return <Store size={size} color={color} />;
    case 'Smartphone': return <Smartphone size={size} color={color} />;
    case 'Activity': return <Activity size={size} color={color} />;
    case 'Skull': return <Skull size={size} color={color} />;
    case 'AlertTriangle': return <AlertTriangle size={size} color={color} />;
    case 'Atom': return <Atom size={size} color={color} />;
    case 'Flame': return <Flame size={size} color={color} />;
    case 'BadgeCheck': return <BadgeCheck size={size} color={color} />;
    case 'PackageSearch': return <PackageSearch size={size} color={color} />;
    case 'ClipboardList': return <ClipboardList size={size} color={color} />;
    case 'ClipboardCheck': return <ClipboardCheck size={size} color={color} />;
    case 'Droplet': return <Droplet size={size} color={color} />;
    case 'ShieldAlert': return <ShieldAlert size={size} color={color} />;
    case 'Microscope': return <Microscope size={size} color={color} />;
    case 'FileCheck2': return <FileCheck2 size={size} color={color} />;
    case 'Share2': return <Share2 size={size} color={color} />;
    case 'Beaker': return <Beaker size={size} color={color} />;
    default: return null;
  }
}

export function HomeScreen() {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const route = useRoute<RouteProp<TabParamList, 'Home'>>();
  const insets = useSafeAreaInsets();
  const nav = useNavColors();
  const topInset = insets.top > 0 ? insets.top : (Platform.OS === 'ios' ? 47 : 24);
  const headerTopPadding = topInset + 8;
  const heroTopPadding = headerTopPadding + 54;
  const { width: SCREEN_WIDTH } = Dimensions.get('window');
  const DRAWER_WIDTH = SCREEN_WIDTH * 0.75;

  // Latest Reports shows only products that passed — expired and failed ones are left out.
  const { data: passFail, isLoading: reportsLoading, refetch: refetchPassFail } = useReports('pass-fail', { per_page: 6, status: 'pass' });
  // Every certified brand (all pages) — the strip must never be cut off at a page size.
  const { data: brandList = [], refetch: refetchBrands } = useAllCertifiedBrands();
  const { data: offersRes, refetch: refetchOffers } = useOffers();
  const { data: videosRes, refetch: refetchVideos } = useYoutubeVideos();
  const { data: bannersRes, refetch: refetchBanners } = useBanners('home');
  const { data: settingsRes, refetch: refetchSettings } = useSettings();
  const { data: categoriesRes, refetch: refetchCategories } = useCategories();
  const { refreshing, onRefresh } = usePullToRefresh([
    refetchPassFail, refetchBrands, refetchOffers, refetchVideos, refetchBanners, refetchSettings, refetchCategories,
  ]);

  const [drawerOpen, setDrawerOpen] = useState(false);
  const slideAnim = useRef(new Animated.Value(SCREEN_WIDTH * 0.75)).current;
  const backdropOpacity = useRef(new Animated.Value(0)).current;

  const toggleDrawer = (open: boolean) => {
    if (open) {
      setDrawerOpen(true);
      Animated.parallel([
        Animated.timing(slideAnim, {
          toValue: 0,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.timing(backdropOpacity, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
      ]).start();
    } else {
      Animated.parallel([
        Animated.timing(slideAnim, {
          toValue: SCREEN_WIDTH * 0.75,
          duration: 250,
          useNativeDriver: true,
        }),
        Animated.timing(backdropOpacity, {
          toValue: 0,
          duration: 250,
          useNativeDriver: true,
        }),
      ]).start(() => setDrawerOpen(false));
    }
  };

  useEffect(() => {
    if (route.params?.openDrawer) {
      toggleDrawer(true);
      navigation.setParams({ openDrawer: undefined });
    }
  }, [route.params?.openDrawer, navigation]);

  // Setup loop animation using native Animated driver
  const rotateAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.loop(
      Animated.timing(rotateAnim, {
        toValue: 1,
        duration: 20000,
        easing: Easing.linear,
        useNativeDriver: true,
      }),
    ).start();
  }, [rotateAnim]);

  const rotateClockwise = rotateAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  const rotateCounterClockwise = rotateAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '-360deg'],
  });

  const brands = brandList;

  const offers = offersRes?.data ?? [];
  const videos = videosRes?.data ?? [];
  const homeBanners = bannersRes?.data ?? [];

  const categories = (categoriesRes?.data ?? []).filter((c) => !c.is_upcoming);

  // Live counts from the backend (never admin-entered); nothing is shown — rather than a made-up
  // number — until they load.
  const settings = settingsRes?.data;
  const heroStats = settings?.hero_stats;
  const statValue = (n: number | undefined) => (typeof n === 'number' ? `${n.toLocaleString('en-IN')}+` : '–');

  const handleCategoryPress = (slug: string) => {
    // Navigate to standard Reports screen prefilled with this category
    navigation.navigate('Tabs', {
      screen: 'Reports',
      params: { category: slug }
    });
  };

  return (
    <View className="flex-1 bg-white dark:bg-surface-1">
      {/* Floating Transparent Header */}
      <View
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          zIndex: 40,
          paddingTop: headerTopPadding,
          paddingBottom: 10,
          paddingHorizontal: 20,
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
      >
        <View className="flex-row items-center gap-2">
          <TrustifiedStamp size={26} />
          <Text className="text-lg font-display font-extrabold text-white">Trustified</Text>
        </View>
        <View className="flex-row items-center gap-2.5">
          <Pressable
            onPress={() => navigation.navigate('Tabs', { screen: 'ShopTab' })}
            accessibilityRole="button"
            accessibilityLabel="Shop"
            style={{ width: 36, height: 36 }}
            className="rounded-full bg-white/10 items-center justify-center active:bg-white/20"
          >
            <ShoppingBag size={18} color="#ffffff" />
          </Pressable>
          <Pressable
            onPress={() => navigation.navigate('Tabs', { screen: 'Search' })}
            accessibilityRole="button"
            accessibilityLabel="Search"
            style={{ width: 36, height: 36 }}
            className="rounded-full bg-white/10 items-center justify-center active:bg-white/20"
          >
            <Search size={18} color="#ffffff" />
          </Pressable>
          <Pressable
            onPress={() => toggleDrawer(true)}
            accessibilityRole="button"
            accessibilityLabel="Menu"
            style={{ width: 36, height: 36 }}
            className="rounded-full bg-white/10 items-center justify-center active:bg-white/20"
          >
            <Menu size={18} color="#ffffff" />
          </Pressable>
        </View>
      </View>

      <ScrollView
        className="flex-1 bg-white dark:bg-surface-1"
        contentContainerClassName="pb-16"
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor="#ffffff"
            colors={[colors.brand[500]]}
            progressBackgroundColor="#ffffff"
          />
        }
      >
        {/* Hero Section */}
        <View
          className="bg-[#141515] px-6 pb-12 relative overflow-hidden"
          style={{ paddingTop: heroTopPadding }}
        >
          {/* Ambient Glow Background Effect */}
          <View className="absolute top-[-50%] left-[-20%] w-[100%] h-[100%] rounded-full bg-brand-500/10 blur-[80px]" />
          <View className="absolute bottom-[-30%] right-[-10%] w-[80%] h-[80%] rounded-full bg-gold-400/5 blur-[90px]" />

          <FadeIn>
            <Text className="text-3xl font-display font-extrabold leading-tight text-white">
              India's Most Trusted{' '}
              <Text className="text-brand-500">Supplement</Text>{' '}
              <Text className="text-[#f9b531]">Certification</Text>
            </Text>
            <Text className="mt-3 text-base text-ink-300 font-medium">We test. We certify. You trust.</Text>

            <View className="mt-6 flex-row">
              <Button
                variant="primary"
                onPress={() => navigation.navigate('Tabs', { screen: 'Reports' })}
                className="rounded-2xl flex-row items-center gap-1.5"
                accessibilityLabel="Explore reports">
                <Text className="font-semibold text-white">Explore Reports</Text>
                <ChevronRight size={16} color="#fff" />
              </Button>
            </View>

            {/* Dynamic Counters loaded from backend Settings */}
            <View className="mt-10 flex-row justify-between gap-x-4 pr-4 border-t border-ink-800/60 pt-6">
              <Stat icon={<CheckCircle size={20} color="#2ab841" />} label="Total certified products" value={statValue(heroStats?.certified_products)} />
              <Stat icon={<Trophy size={20} color="#2ab841" />} label="Brands" value={statValue(heroStats?.brands)} />
              <Stat icon={<Beaker size={20} color="#2ab841" />} label="Tests conducted" value={statValue(heroStats?.tests_conducted)} />
            </View>

            {/* Web-aligned Hero Graphic Stamp Illustration positioned below counters */}
            <View className="items-center justify-center py-6 mt-6 relative">
              {/* Outer rotating dashed ring */}
              <Animated.View
                style={{
                  width: 170,
                  height: 170,
                  borderRadius: 85,
                  borderWidth: 3,
                  borderStyle: 'dashed',
                  borderColor: 'rgba(42, 184, 65, 0.4)',
                  position: 'absolute',
                  transform: [{ rotate: rotateClockwise }],
                }}
              />
              {/* Inner rotating gold border (reverse rotation) */}
              <Animated.View
                style={{
                  width: 146,
                  height: 146,
                  borderRadius: 73,
                  borderWidth: 1,
                  borderColor: 'rgba(249, 181, 49, 0.4)',
                  position: 'absolute',
                  transform: [{ rotate: rotateCounterClockwise }],
                }}
              />
              {/* Soft background glow */}
              <View className="absolute w-32 h-32 rounded-full bg-brand-500/10 blur-2xl" />

              {/* Stamp in the center */}
              <View className="w-24 h-24 items-center justify-center z-10">
                <TrustifiedStamp size={90} />
              </View>
            </View>
          </FadeIn>
        </View>

        {/* Admin banners with position "home" */}
        {homeBanners.length > 0 ? (
          <View className="py-6">
            <BannerSlider banners={homeBanners} className="mx-6" />
          </View>
        ) : null}

        {/* Why We're Better Section */}
        <View className="bg-ink-50/60 py-8 border-y border-ink-100/50">
          <SectionHeader
            title="Why We're Better"
            subtitle="The pillars of our independent certification"
            className="px-6"
          />
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerClassName="gap-4 px-6 py-4"
          >
            {WHY_BETTER_ITEMS.map((item) => (
              <View
                key={item.title}
                className="w-64 rounded-[2rem] bg-white dark:bg-surface-1 border border-ink-100 dark:border-ink-800 p-6 shadow-sm"
              >
                <View
                  className="w-14 h-14 rounded-full items-center justify-center mb-5"
                  style={{ backgroundColor: item.bgColor }}
                >
                  {getSectionIcon(item.iconName, 26, item.iconColor)}
                </View>
                <Text className="text-lg font-display font-bold text-ink-900 dark:text-white mb-2">{item.title}</Text>
                <Text className="text-xs leading-relaxed text-ink-600 dark:text-ink-300 font-medium">{item.body}</Text>
              </View>
            ))}
          </ScrollView>
        </View>

        {/* Join on YouTube / Become a Member Section (New from Web) */}
        <View className="bg-[#141515] py-10 px-6 border-y border-ink-950">
          <View className="inline-flex flex-row items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#FF0000]/10 border border-[#FF0000]/30 mb-4 self-start">
            <Youtube size={16} color="#FF0000" />
            <Text className="text-[#FF0000] font-bold text-xs">Official Channel</Text>
          </View>

          <Text className="text-2xl font-display font-bold text-white leading-tight">
            Join on YouTube{'\n'}Become a <Text className="text-brand-500">TRUSTIFIED</Text> Member
          </Text>
          <Text className="text-ink-300 text-sm mt-3 leading-relaxed">
            At TRUSTIFIED, you're not just joining a platform — you're fueling a movement for honesty in health.
          </Text>

          <Button
            variant="primary"
            onPress={() => Linking.openURL('https://www.youtube.com/@Trustified-Certification/join')}
            className="mt-5 rounded-2xl bg-brand-600 self-start px-6"
            accessibilityLabel="Join the Movement">
            <Text className="font-semibold text-white">Join the Movement</Text>
          </Button>

          {/* Benefits Grid */}
          <View className="mt-8 gap-4">
            {YOUTUBE_MEMBERSHIP_BENEFITS.map((benefit, idx) => {
              const Icon = benefit.icon;
              return (
                <View key={idx} className="flex-row gap-3 bg-ink-900/50 border border-ink-800/60 p-4 rounded-2xl">
                  <View className="w-10 h-10 rounded-xl bg-ink-800/80 items-center justify-center shrink-0">
                    <Icon size={20} color="#48c869" />
                  </View>
                  <View className="flex-1">
                    <Text className="text-sm font-bold text-white mb-0.5">{benefit.title}</Text>
                    <Text className="text-xs text-ink-400 dark:text-ink-500 leading-relaxed font-medium">{benefit.body}</Text>
                  </View>
                </View>
              );
            })}
          </View>
        </View>

        {/* What We Test Section */}
        <View className="py-8 border-b border-ink-100/30">
          <SectionHeader
            title="What We Test"
            subtitle="Independent analysis across quality, purity, safety, and authenticity."
            className="px-6"
          />
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerClassName="gap-4 px-6 py-4"
          >
            {WHAT_WE_TEST_ITEMS.map((item) => (
              <View
                key={item.title}
                className="w-56 rounded-2xl bg-white dark:bg-surface-1 border border-ink-100 dark:border-ink-800 p-4 shadow-sm flex-row items-center gap-3"
              >
                <View className="w-10 h-10 rounded-xl bg-ink-50 dark:bg-surface-2 items-center justify-center shrink-0">
                  {getSectionIcon(item.iconName, 20, '#2ab841')}
                </View>
                <View className="flex-1">
                  <Text className="text-xs font-bold text-ink-900 dark:text-white" numberOfLines={1}>{item.title}</Text>
                  <Text className="text-[10px] text-ink-500 dark:text-ink-400 font-medium mt-0.5" numberOfLines={2}>{item.desc}</Text>
                </View>
              </View>
            ))}
          </ScrollView>
        </View>

        {/* Testing Process Section */}
        <View className="py-8 bg-ink-50/20 border-b border-ink-100/30">
          <SectionHeader
            title="Testing Process"
            subtitle="How our independent 4-step certification works"
            className="px-6"
          />
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerClassName="gap-4 px-6 py-4"
          >
            {TESTING_STEPS.map((item, index) => (
              <View
                key={item.title}
                className="w-60 bg-white dark:bg-surface-1 border border-ink-100 dark:border-ink-800 rounded-2xl p-5 shadow-sm relative overflow-visible mt-2"
              >
                {/* Step number badge */}
                <View className="absolute -top-3 -right-2 w-7 h-7 rounded-full bg-brand-600 items-center justify-center shadow-md z-10">
                  <Text className="text-white text-xs font-extrabold">{index + 1}</Text>
                </View>
                <View className="w-12 h-12 rounded-full bg-brand-50 dark:bg-brand-950/60 items-center justify-center mb-3">
                  {getSectionIcon(item.iconName, 24, '#2ab841')}
                </View>
                <Text className="text-sm font-bold text-ink-900 dark:text-white mb-2">
                  {item.title}
                </Text>
                <Text className="text-xs leading-relaxed text-ink-600 dark:text-ink-300 font-medium">
                  {item.body}
                </Text>
              </View>
            ))}
          </ScrollView>
        </View>

        {/* Support Our Mission Section */}
        <View className="py-8 bg-ink-50/20 border-b border-ink-100/30">
          <SectionHeader
            title="Support Our Mission"
            subtitle="At TRUSTIFIED, every product goes through 100% blind testing. You can help our mission by:"
            className="px-6"
          />
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerClassName="gap-4 px-6 py-4"
          >
            {SUPPORT_MISSION_ITEMS.map((item) => (
              <View
                key={item.title}
                className="w-60 rounded-2xl bg-white dark:bg-surface-1 border border-ink-100 dark:border-ink-800 p-6 shadow-sm"
              >
                <View className="w-12 h-12 rounded-xl bg-brand-50 items-center justify-center mb-4">
                  {getSectionIcon(item.iconName, 22, '#2ab841')}
                </View>
                <Text className="text-base font-bold text-ink-900 dark:text-white mb-2">{item.title}</Text>
                <Text className="text-xs leading-relaxed text-ink-600 dark:text-ink-300 font-medium">{item.body}</Text>
                {item.screen ? (
                  <Pressable
                    onPress={() => navigation.navigate('Tabs', { screen: 'ShopTab' })}
                    accessibilityRole="button"
                    className="mt-3 flex-row items-center gap-1 self-start"
                  >
                    <Text className="text-xs font-bold text-brand-600">Visit the shop</Text>
                    <ChevronRight size={14} color={colors.brand[600]} />
                  </Pressable>
                ) : null}
              </View>
            ))}
          </ScrollView>
        </View>

        {/* Latest Reports Section */}
        <View className="px-6 py-8">
          <SectionHeader
            title="Latest Reports"
            subtitle="Freshly tested products from the lab"
            onSeeAll={() => navigation.navigate('Tabs', { screen: 'Reports' })}
          />
          {reportsLoading ? (
            <Spinner />
          ) : (
            <StaggerChildren className="mt-4 flex-row flex-wrap justify-between gap-y-4">
              {(passFail?.data ?? []).map((product) => (
                <View key={product.id} className="w-[48%]">
                  <ProductCard product={product} to="ProductDetail" />
                </View>
              ))}
            </StaggerChildren>
          )}
        </View>

        {/* Categories Row Redesigned like Web Carousel */}
        {categories.length > 0 ? (
          <View className="py-6 bg-ink-50/30">
            <SectionHeader
              title="Categories"
              subtitle="Browse products across every category we test"
              className="px-6 mb-4"
            />
            <View className="px-6">
              <InfiniteMarquee itemWidth={112} gap={16} speed={0.8}>
                {categories.map((cat) => (
                  <Pressable
                    key={cat.id}
                    onPress={() => handleCategoryPress(cat.slug)}
                    className="group items-center w-full rounded-2xl bg-white dark:bg-surface-1 border border-ink-100 dark:border-ink-800 p-4 shadow-sm active:bg-brand-50/10 active:border-brand-300"
                  >
                    <View className="size-14 rounded-full overflow-hidden bg-ink-50 dark:bg-surface-2 border border-ink-100 dark:border-ink-800 items-center justify-center mb-2">
                      {cat.image_url ? (
                        <MediaFrame src={cat.image_url} alt={cat.name} aspect="square" rounded="full" className="w-full h-full" />
                      ) : (
                        <Text className="text-2xl font-display font-extrabold text-ink-300">
                          {cat.name.trim().charAt(0).toUpperCase() || '?'}
                        </Text>
                      )}
                    </View>
                    <Text className="text-center text-xs font-bold text-ink-900 dark:text-white leading-snug line-clamp-2" numberOfLines={2}>
                      {cat.name}
                    </Text>
                  </Pressable>
                ))}
              </InfiniteMarquee>
            </View>
          </View>
        ) : null}

        {/* Certified Brands Section */}
        {brands.length > 0 ? (
          <View className="py-6 border-t border-ink-100/50">
            <SectionHeader
              title="Certified Brands"
              subtitle="Brands that have successfully passed our rigorous independent blind testing process."
              className="px-6 mb-4"
              onSeeAll={() => navigation.navigate('CertifiedBrands')}
            />
            <View className="px-6">
              <InfiniteMarquee itemWidth={96} gap={16} speed={0.6}>
                {brands.map((brand) => (
                  <Pressable
                    key={brand.id}
                    // A brand opens the Pass & Fail list filtered to that brand.
                    onPress={() => brand.slug && navigation.navigate('Tabs', { screen: 'Reports', params: { brand: brand.slug } })}
                    accessibilityRole="button"
                    accessibilityLabel={brand.name}
                    className="w-full items-center"
                  >
                    {/* Brands without a logo still show — as their initial. */}
                    {brand.logo_url ? (
                      <MediaFrame src={brand.logo_url} alt={brand.name} aspect="square" rounded="xl" className="w-20 shadow-sm border border-ink-100 dark:border-ink-800" />
                    ) : (
                      <View className="h-20 w-20 items-center justify-center rounded-xl border border-ink-100 bg-ink-50 dark:border-ink-800 dark:bg-surface-2">
                        <Text className="text-2xl font-bold text-ink-400">{brand.name.charAt(0).toUpperCase()}</Text>
                      </View>
                    )}
                    <Text className="mt-1 text-center text-xs font-semibold text-ink-700 dark:text-ink-200" numberOfLines={1}>
                      {brand.name}
                    </Text>
                  </Pressable>
                ))}
              </InfiniteMarquee>
            </View>
          </View>
        ) : null}

        {/* Exclusive Offers */}
        {offers.length > 0 ? (
          <View className="bg-ink-900 py-8">
            <SectionHeader
              title="Exclusive Offers"
              subtitle="Special deals from our certified partners"
              className="px-6"
              light
            />
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerClassName="gap-4 px-6 py-4">
              {offers.map((offer) => (
                <View key={offer.id} className="w-64 overflow-hidden rounded-2xl bg-ink-950 border border-ink-800">
                  <MediaFrame src={offer.image_url} alt={offer.title ?? ''} aspect="video" rounded="lg" />
                  <View className="p-4">
                    <Text className="text-base font-bold text-white" numberOfLines={1}>
                      {offer.title}
                    </Text>
                    {offer.description ? (
                      <Text className="mt-1 text-xs text-ink-400 dark:text-ink-500 font-medium" numberOfLines={2}>
                        {offer.description}
                      </Text>
                    ) : null}
                  </View>
                </View>
              ))}
            </ScrollView>
          </View>
        ) : null}

        {/* Latest Videos */}
        {videos.length > 0 ? (
          <View className="px-6 py-8">
            <SectionHeader
              title="Latest Videos"
              subtitle="Watch our recent independent reviews"
            />
            {/* Auto-scrolling strip (pauses on touch); with only a few videos it centres instead of scrolling. */}
            <View className="-mx-6 py-4">
              <ProductRail
                data={videos}
                keyExtractor={(v) => String(v.id)}
                itemWidth={256}
                gap={16}
                paddingHorizontal={24}
                renderItem={({ item: video }) => (
                  <Pressable
                    onPress={() => video.url && Linking.openURL(video.url)}
                    accessibilityRole="button"
                    accessibilityLabel={video.title ?? 'Watch video'}
                    style={{ width: 256 }}
                    className="overflow-hidden rounded-2xl border border-ink-100 dark:border-ink-800 bg-white dark:bg-surface-1 active:opacity-95 shadow-sm">
                    <View className="relative">
                      <MediaFrame src={video.thumbnail_url} alt={video.title ?? ''} aspect="video" rounded="lg" />
                      <View className="absolute inset-0 items-center justify-center bg-black/20">
                        <View className="size-12 items-center justify-center rounded-full bg-white/90 shadow-md">
                          <PlayCircle size={24} color="#FF0000" />
                        </View>
                      </View>
                    </View>
                    <View className="p-3">
                      <Text className="text-sm font-bold text-ink-900 dark:text-white" numberOfLines={2}>
                        {video.title}
                      </Text>
                    </View>
                  </Pressable>
                )}
              />
            </View>
          </View>
        ) : null}

      </ScrollView>

      {/* Side Navigation Drawer Overlay */}
      {drawerOpen && (
        <View style={{ position: 'absolute', top: 0, bottom: 0, left: 0, right: 0, zIndex: 100 }}>
          {/* Backdrop */}
          <Pressable
            onPress={() => toggleDrawer(false)}
            style={{ position: 'absolute', top: 0, bottom: 0, left: 0, right: 0 }}
          >
            <Animated.View
              style={{
                flex: 1,
                backgroundColor: 'rgba(0, 0, 0, 0.4)',
                opacity: backdropOpacity,
              }}
            />
          </Pressable>

          {/* Drawer content */}
          <Animated.View
            style={{
              position: 'absolute',
              top: 0,
              bottom: 0,
              right: 0,
              width: DRAWER_WIDTH,
              backgroundColor: nav.screenBackground,
              shadowColor: '#000000',
              shadowOffset: { width: -4, height: 0 },
              shadowOpacity: 0.1,
              shadowRadius: 12,
              elevation: 16,
              paddingTop: insets.top + 16,
              paddingHorizontal: 20,
              transform: [{ translateX: slideAnim }],
            }}
          >
            {/* Drawer Header */}
            <View className="flex-row items-center justify-between pb-6 border-b border-ink-100 dark:border-ink-800">
              <View className="flex-row items-center gap-2">
                <TrustifiedStamp size={28} />
                <Text className="text-lg font-display font-extrabold text-ink-900 dark:text-white">Trustified</Text>
              </View>
              <Pressable onPress={() => toggleDrawer(false)} className="p-1 rounded-full active:bg-ink-50">
                <X size={20} color={colors.ink[600]} />
              </Pressable>
            </View>

            {/* Drawer Links list */}
            <ScrollView contentContainerClassName="py-4 gap-1" showsVerticalScrollIndicator={false}>
              <DrawerLink label="Home" onPress={() => { toggleDrawer(false); navigation.navigate('Tabs', { screen: 'Home' }); }} />
              <DrawerLink label="Products" onPress={() => { toggleDrawer(false); navigation.navigate('Tabs', { screen: 'Reports', params: { fromDrawer: true } }); }} />
              <DrawerLink label="Certified Brands" onPress={() => { toggleDrawer(false); navigation.navigate('CertifiedBrands', { fromDrawer: true }); }} />
              <DrawerLink label="Shop" onPress={() => { toggleDrawer(false); navigation.navigate('Tabs', { screen: 'ShopTab' }); }} />
              <DrawerLink label="Rankings" onPress={() => { toggleDrawer(false); navigation.navigate('RankingsIndex'); }} />
              <DrawerLink label="Verify Certificate" onPress={() => { toggleDrawer(false); navigation.navigate('Verify'); }} />
              <DrawerLink label="Challenge a Result" onPress={() => { toggleDrawer(false); navigation.navigate('Challenge'); }} />
              <DrawerLink label="About Us" onPress={() => { toggleDrawer(false); navigation.navigate('About'); }} />
              <DrawerLink label="Gold Certification" onPress={() => { toggleDrawer(false); navigation.navigate('Testing'); }} />
              <DrawerLink label="Get Certified" onPress={() => { toggleDrawer(false); navigation.navigate('GetCertified'); }} />
            </ScrollView>
          </Animated.View>
        </View>
      )}
    </View>
  );
}

function DrawerLink({ label, onPress }: { label: string; onPress: () => void }) {
  return (
    <Pressable
      onPress={onPress}
      className="flex-row items-center justify-between py-3.5 px-3 rounded-2xl active:bg-ink-50"
    >
      <Text className="text-sm font-semibold text-ink-800 dark:text-ink-100">{label}</Text>
      <ChevronRight size={14} color={colors.ink[400]} />
    </Pressable>
  );
}

function Stat({ label, value, icon }: { label: string; value: string | number; icon?: React.ReactNode }) {
  return (
    <View className="flex-1">
      {icon ? <View className="mb-1">{icon}</View> : null}
      <Text className="text-xl font-display font-extrabold text-white">{value}</Text>
      <Text className="mt-1 text-[11px] font-semibold text-ink-400 dark:text-ink-500" numberOfLines={2}>{label}</Text>
    </View>
  );
}

function SectionHeader({
  title,
  subtitle,
  onSeeAll,
  className = '',
  light = false,
}: {
  title: string;
  subtitle?: string;
  onSeeAll?: () => void;
  className?: string;
  light?: boolean;
}) {
  return (
    <View className={`${className}`}>
      <View className="flex-row items-center justify-between">
        <Text className={`text-xl font-display font-bold ${light ? 'text-white' : 'text-ink-900'}`}>{title}</Text>
        {onSeeAll ? (
          <Button variant="ghost" size="sm" onPress={onSeeAll} accessibilityLabel={`See all ${title}`}>
            <Text className="text-sm font-semibold text-brand-700">See all</Text>
            <ChevronRight size={14} color={colors.brand[700]} />
          </Button>
        ) : null}
      </View>
      {subtitle ? (
        <Text className={`text-xs mt-0.5 ${light ? 'text-ink-300' : 'text-ink-500'} font-medium`}>{subtitle}</Text>
      ) : null}
    </View>
  );
}
