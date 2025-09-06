import { View, StyleSheet, LayoutChangeEvent } from "react-native";
import { BottomTabBarProps } from "@react-navigation/bottom-tabs";
import TabBarButton from "@/components/TabBarButton";
import Animated, { 
  useAnimatedStyle, 
  useSharedValue, 
  withTiming
} from "react-native-reanimated";
import { useState } from "react";
import { Colors } from "@/constants/Colors";
import { BlurView } from "expo-blur";

export function TabBar({ state, descriptors, navigation }: BottomTabBarProps) {
  const [dimensions, setDimensions] = useState({ height: 20, width: 100 });
  const buttonWidth = dimensions.width / state.routes.length;

  const onTabbarLayout = (e: LayoutChangeEvent) => {
    setDimensions({
      height: e.nativeEvent.layout.height,
      width: e.nativeEvent.layout.width,
    });
  };

  const tabPositionX = useSharedValue(0);

  const animatedIndicatorStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: tabPositionX.value }],
  }));

  return (
    <View style={styles.container}>
      {/* Blur background */}
      <BlurView intensity={30} tint="light" style={styles.blurContainer}>
        <View onLayout={onTabbarLayout} style={styles.tabbar}>
          {/* Indicator */}
          <Animated.View
            style={[
              animatedIndicatorStyle,
              styles.indicator,
              {
                width: buttonWidth * 0.6,
                left: buttonWidth * 0.2,
              },
            ]}
          />

          {state.routes.map((route, index) => {
            const { options } = descriptors[route.key];
            const label =
              typeof options.tabBarLabel === "string"
                ? options.tabBarLabel
                : options.title ?? route.name;

            const isFocused = state.index === index;

            const onPress = () => {
              tabPositionX.value = withTiming(buttonWidth * index, {
                duration: 250,
              });

              const event = navigation.emit({
                type: "tabPress",
                target: route.key,
                canPreventDefault: true,
              });

              if (!isFocused && !event.defaultPrevented) {
                navigation.navigate(route.name as never);
              }
            };

            const onLongPress = () => {
              navigation.emit({
                type: "tabLongPress",
                target: route.key,
              });
            };

            return (
              <TabBarButton
                key={route.name}
                onPress={onPress}
                onLongPress={onLongPress}
                isFocused={isFocused}
                routeName={route.name as "index" | "discover" | "saved" | "settings"}
                label={label as string}
              />
            );
          })}
        </View>
      </BlurView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: "transparent",
  },
  blurContainer: {
    borderRadius: 40,             
    marginHorizontal: 20,
    marginBottom: 20,
    overflow: "hidden",
    backgroundColor: "rgba(255,255,255,0.9)",
    // Shadow iOS
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    // Shadow Android
    elevation: 8,
  },
  tabbar: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-around",
    paddingVertical: 5,          
    paddingHorizontal: 10,
    position: "relative",
  },
  indicator: {
    position: "absolute",
    backgroundColor: Colors.tint,
    top: 4,
    height: 3,
    borderRadius: 2,
    opacity: 0.9,
  },
});



// Alternative styles for dark mode
export const darkStyles = StyleSheet.create({
  blurContainer: {
    backgroundColor: 'rgba(0, 0, 0, 0.85)',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: -4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 20,
  },
  bottomSafeArea: {
    backgroundColor: 'rgba(0, 0, 0, 0.95)',
  },
});

// Variant with floating design (updated)
export const floatingStyles = StyleSheet.create({
  container: {
    backgroundColor: 'transparent',
    paddingBottom: 30,
    paddingHorizontal: 24, // More padding for dramatic floating effect
  },
  tabbarWrapper: {
    backgroundColor: 'rgba(255, 255, 255, 0.92)',
    borderRadius: 50, // Bo tròn hoàn toàn như pill shape
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 12,
    },
    shadowOpacity: 0.2,
    shadowRadius: 28,
    elevation: 30,
    borderWidth: 1.5,
    borderColor: 'rgba(255, 255, 255, 0.4)',
  },
  tabbar: {
    flexDirection: "row",
    paddingVertical: 20,
    paddingHorizontal: 24,
    position: 'relative',
  },
  indicator: {
    position: "absolute",
    backgroundColor: Colors.tint,
    top: 8,
    height: 40, // Full height background
    borderRadius: 20,
    opacity: 0.12,
  },
});