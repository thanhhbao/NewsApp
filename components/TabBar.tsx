// components/TabBar.tsx
import React, { useEffect, useState } from 'react';
import { View, StyleSheet, LayoutChangeEvent, Platform, ColorValue } from 'react-native';
import { BottomTabBarProps } from '@react-navigation/bottom-tabs';
import Animated, { useAnimatedStyle, useSharedValue, withTiming } from 'react-native-reanimated';
import { BlurView } from 'expo-blur';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import TabBarButton from '@/components/TabBarButton';
import { useAppTheme } from '@/providers/ThemeProvider';


const ROUTE_KEYS = ['index', 'discover', 'saved', 'profile'] as const;
type RouteKey = typeof ROUTE_KEYS[number];

function normalizeRouteName(name: string): RouteKey {
  const last = name.split('/').pop()?.toLowerCase() ?? 'index';
  return (ROUTE_KEYS as readonly string[]).includes(last as RouteKey)
    ? (last as RouteKey)
    : 'index';
}

const BLUR_INTENSITY_IOS = 90;
const BLUR_INTENSITY_ANDROID = 70;
const BLUR_INTENSITY = Platform.OS === 'ios' ? BLUR_INTENSITY_IOS : BLUR_INTENSITY_ANDROID;
const GLASS_COLORS: readonly [ColorValue, ColorValue] = [
  'rgba(255,255,255,0.35)',
  'rgba(255,255,255,0.18)',
];

export function TabBar({ state, descriptors, navigation }: BottomTabBarProps) {
  const insets = useSafeAreaInsets();
  const { theme } = useAppTheme();

  const [dimensions, setDimensions] = useState({ height: 20, width: 100 });
  const buttonWidth = dimensions.width / Math.max(state.routes.length, 1);

  const onTabbarLayout = (e: LayoutChangeEvent) => {
    const { width, height } = e.nativeEvent.layout;
    setDimensions({ width, height });
  };

  const tabPositionX = useSharedValue(0);
  useEffect(() => {
    tabPositionX.value = withTiming(buttonWidth * state.index, { duration: 250 });
  }, [buttonWidth, state.index]);

  const animatedIndicatorStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: tabPositionX.value }],
  }));

  // Glass màu theo theme
  const glassBg =
    theme.name === 'dark'
      ? 'rgba(17,24,39,0.45)' // slate-900/45
      : 'rgba(255,255,255,0.18)';

  const gradientColors =
    theme.name === 'dark'
      ? ['rgba(255,255,255,0.12)', 'rgba(255,255,255,0.06)']
      : ['rgba(255,255,255,0.35)', 'rgba(255,255,255,0.18)'];

  return (
    // Không chiếm chỗ — để nội dung bên dưới không bị “đẩy”
    <View pointerEvents="box-none" style={styles.absoluteRoot}>
      <View
        pointerEvents="box-none"
        style={[
          styles.floatingWrap,
          { left: 14, right: 14, bottom: insets.bottom + 8 },
        ]}
      >
        <BlurView
          intensity={BLUR_INTENSITY}
          tint={theme.name === 'dark' ? 'dark' : 'light'}
          experimentalBlurMethod={Platform.OS === 'android' ? 'dimezisBlurView' : undefined}
          style={[
            styles.blurContainer,
            {
              backgroundColor: glassBg,
              borderColor:
                theme.name === 'dark'
                  ? 'rgba(255,255,255,0.18)'
                  : 'rgba(255,255,255,0.45)',
            },
          ]}
        >
          {/* Lớp gradient nhẹ để “glass” rõ hơn */}
          <LinearGradient
  pointerEvents="none"
  colors={GLASS_COLORS}
  start={{ x: 0, y: 0 }}
  end={{ x: 1, y: 1 }}
  style={StyleSheet.absoluteFill}
/>


          <View onLayout={onTabbarLayout} style={styles.tabbar} accessibilityRole="tablist">
            {/* Indicator mảnh & ngắn hơn */}
            <Animated.View
              style={[
                animatedIndicatorStyle,
                styles.indicator,
                {
                  width: buttonWidth * 0.48,
                  left: buttonWidth * 0.26,
                  backgroundColor: theme.tint,
                  shadowColor: theme.tint,
                },
              ]}
            />

            {state.routes.map((route, index) => {
              const { options } = descriptors[route.key];
              const label =
                typeof options.tabBarLabel === 'string'
                  ? options.tabBarLabel
                  : options.title ?? route.name;

              const isFocused = state.index === index;

              const onPress = () => {
                tabPositionX.value = withTiming(buttonWidth * index, { duration: 250 });
                const event = navigation.emit({
                  type: 'tabPress',
                  target: route.key,
                  canPreventDefault: true,
                });
                if (!isFocused && !event.defaultPrevented) {
                  navigation.navigate(route.name as never);
                }
              };

              const onLongPress = () => {
                navigation.emit({ type: 'tabLongPress', target: route.key });
              };

              return (
                <TabBarButton
                  key={route.key}
                  onPress={onPress}
                  onLongPress={onLongPress}
                  isFocused={isFocused}
                  routeName={normalizeRouteName(route.name)}
                  label={String(label)}
                />
              );
            })}
          </View>
        </BlurView>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  absoluteRoot: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    height: 0,
  },
  floatingWrap: {
    position: 'absolute',
  },
  blurContainer: {
    borderRadius: 32, // bo tròn hơn
    overflow: 'hidden',
    // viền & bóng nhẹ cho hiệu ứng kính
    borderWidth: 0.75,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.14,
    shadowRadius: 18,
    elevation: 10,
  },
  tabbar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    paddingVertical: 6, // nhỏ gọn
    paddingHorizontal: 10,
    minHeight: 54, // thấp hơn trước
  },
  indicator: {
    position: 'absolute',
    top: 5,
    height: 2, // mảnh hơn
    borderRadius: 2,
    opacity: 0.95,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.35,
    shadowRadius: 4,
    elevation: 4,
  },
});
