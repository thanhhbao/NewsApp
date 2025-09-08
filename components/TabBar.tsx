import { View, StyleSheet, LayoutChangeEvent } from 'react-native';
import { BottomTabBarProps } from '@react-navigation/bottom-tabs';
import TabBarButton from '@/components/TabBarButton';
import Animated, { useAnimatedStyle, useSharedValue, withTiming } from 'react-native-reanimated';
import { useEffect, useState } from 'react';
import { Colors } from '@/constants/Colors';
import { BlurView } from 'expo-blur';

const ROUTE_KEYS = ['index','discover','saved','settings'] as const;
type RouteKey = typeof ROUTE_KEYS[number];

function normalizeRouteName(name: string): RouteKey {
  const last = name.split('/').pop()?.toLowerCase() ?? 'index';
  return (ROUTE_KEYS as readonly string[]).includes(last)
    ? (last as RouteKey)
    : 'index';
}


export function TabBar({ state, descriptors, navigation }: BottomTabBarProps) {
  const [dimensions, setDimensions] = useState({ height: 20, width: 100 });
  const buttonWidth = dimensions.width / Math.max(state.routes.length, 1);

  const onTabbarLayout = (e: LayoutChangeEvent) => {
    const { width, height } = e.nativeEvent.layout;
    setDimensions({ width, height });
  };

  const tabPositionX = useSharedValue(0);

  // 👇 Căn indicator đúng ngay từ đầu và khi index/width thay đổi
  useEffect(() => {
    tabPositionX.value = withTiming(buttonWidth * state.index, { duration: 250 });
  }, [buttonWidth, state.index, tabPositionX]);

  const animatedIndicatorStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: tabPositionX.value }],
  }));

  return (
    <View style={styles.container}>
      <BlurView intensity={30} tint="light" style={styles.blurContainer}>
        <View onLayout={onTabbarLayout} style={styles.tabbar}>
          {/* Indicator */}
          <Animated.View
            style={[
              animatedIndicatorStyle,
              styles.indicator,
              { width: buttonWidth * 0.6, left: buttonWidth * 0.2 },
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
              // Move indicator
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
           const normalizedRoute = normalizeRouteName(route.name);

            return (
              <TabBarButton
                key={route.key}
                onPress={onPress}
                onLongPress={onLongPress}
                isFocused={isFocused}
                routeName={normalizedRoute}
                label={String(label)}
              />
            );
          })}
        </View>
      </BlurView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { backgroundColor: 'transparent' },
  blurContainer: {
    borderRadius: 40,
    marginHorizontal: 20,
    marginBottom: 20,
    overflow: 'hidden',
    backgroundColor: 'rgba(255,255,255,0.9)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 8,
  },
  tabbar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    paddingVertical: 5,
    paddingHorizontal: 10,
    position: 'relative',
  },
  indicator: {
    position: 'absolute',
    backgroundColor: Colors.tint,
    top: 4,
    height: 3,
    borderRadius: 2,
    opacity: 0.9,
  },
});
