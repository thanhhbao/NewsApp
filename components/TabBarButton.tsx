import { Pressable, StyleSheet, useColorScheme } from "react-native";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withTiming,
  withSpring,
  interpolate,
} from "react-native-reanimated";
import { useEffect, useMemo } from "react";
import * as Haptics from "expo-haptics";
import { Colors } from "@/constants/Colors";
import { icon as IconMap } from "@/constants/Icons";

interface TabBarButtonProps {
  onPress: () => void;
  onLongPress: () => void;
  isFocused: boolean;
  routeName: "index" | "discover" | "saved" | "settings";
  label: string;
}

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

export default function TabBarButton({
  onPress,
  onLongPress,
  isFocused,
  routeName,
  label,
}: TabBarButtonProps) {
  // Dùng đúng palette hiện có
  const activeColor = Colors.tabIconSelected || Colors.tint;
  const inactiveColor = Colors.tabIconDefault;

  // Fallback icon renderer
  const renderIcon = useMemo(() => {
    return (
      IconMap[routeName] ||
      IconMap[(routeName as string).split("/").pop()?.toLowerCase() as keyof typeof IconMap] ||
      (IconMap as any).default ||
      IconMap.index
    );
  }, [routeName]);

  const scale = useSharedValue(1);
  const opacity = useSharedValue(0.6);
  const translateY = useSharedValue(0);

  useEffect(() => {
    scale.value = withSpring(isFocused ? 1.1 : 1, { damping: 14, stiffness: 180 });
    opacity.value = withTiming(isFocused ? 1 : 0.6, { duration: 180 });
    translateY.value = withSpring(isFocused ? -2 : 0, { damping: 16, stiffness: 220 });
  }, [isFocused, opacity, scale, translateY]);

  const animatedIconStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }, { translateY: translateY.value }],
    opacity: opacity.value,
  }));

  const animatedLabelStyle = useAnimatedStyle(() => ({
    opacity: interpolate(opacity.value, [0.6, 1], [0.7, 1]),
    transform: [{ scale: interpolate(scale.value, [1, 1.1], [0.96, 1]) }],
  }));

  const onPressIn = () => {
    scale.value = withSpring(0.95, { damping: 18, stiffness: 260 });
  };
  const onPressOut = () => {
    scale.value = withSpring(isFocused ? 1.1 : 1, { damping: 14, stiffness: 180 });
  };
  const handlePress = async () => {
    try { await Haptics.selectionAsync(); } catch {}
    onPress();
  };

  return (
    <AnimatedPressable
      onPress={handlePress}
      onLongPress={onLongPress}
      onPressIn={onPressIn}
      onPressOut={onPressOut}
      style={styles.container}
      android_ripple={{ color: "#eee", borderless: true }}
      accessibilityRole="button"
      accessibilityLabel={`${label} tab`}
      hitSlop={8}
    >
      <Animated.View style={[styles.iconContainer, animatedIconStyle]}>
        {renderIcon?.({
          color: isFocused ? activeColor : inactiveColor,
          focused: isFocused,
        })}
      </Animated.View>

      <Animated.Text
        style={[
          styles.label,
          animatedLabelStyle,
          { color: isFocused ? activeColor : inactiveColor },
        ]}
        numberOfLines={1}
      >
        {label}
      </Animated.Text>

      {isFocused && (
        <Animated.View style={[styles.activeDot, { backgroundColor: activeColor }]} />
      )}
    </AnimatedPressable>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1, alignItems: "center", justifyContent: "center",
    paddingVertical: 8, paddingHorizontal: 4, position: "relative",
  },
  iconContainer: {
    marginBottom: 4, alignItems: "center", justifyContent: "center",
    width: 28, height: 28,
  },
  label: { fontSize: 12, fontWeight: "500", textAlign: "center", marginTop: 2 },
  activeDot: { position: "absolute", bottom: -8, width: 4, height: 4, borderRadius: 2, opacity: 0.9 },
});
