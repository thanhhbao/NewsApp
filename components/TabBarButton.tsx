import { Pressable, StyleSheet } from "react-native";
import Animated, { 
  useAnimatedStyle, 
  useSharedValue, 
  withTiming,
  withSpring,
  interpolate 
} from "react-native-reanimated";
import { useEffect } from "react";
import { Colors } from "@/constants/Colors";
import { icon } from "@/constants/Icons"; 

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
  label 
}: TabBarButtonProps) {
  const scale = useSharedValue(1);
  const opacity = useSharedValue(0.6);
  const translateY = useSharedValue(0);

  useEffect(() => {
    scale.value = withSpring(isFocused ? 1.1 : 1, { damping: 10 });
    opacity.value = withTiming(isFocused ? 1 : 0.6, { duration: 200 });
    translateY.value = withSpring(isFocused ? -2 : 0, { damping: 12 });
  }, [isFocused]);

  const animatedIconStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }, { translateY: translateY.value }],
    opacity: opacity.value,
  }));

  const animatedLabelStyle = useAnimatedStyle(() => ({
    opacity: interpolate(opacity.value, [0.6, 1], [0.7, 1]),
    transform: [{ scale: interpolate(scale.value, [1, 1.1], [0.9, 1]) }],
  }));

  const onPressIn = () => {
    scale.value = withSpring(0.95, { damping: 15 });
  };

  const onPressOut = () => {
    scale.value = withSpring(isFocused ? 1.1 : 1, { damping: 10 });
  };

  return (
    <AnimatedPressable
      onPress={onPress}
      onLongPress={onLongPress}
      onPressIn={onPressIn}
      onPressOut={onPressOut}
      style={[styles.container]}
    >
      <Animated.View style={[styles.iconContainer, animatedIconStyle]}>
        {icon[routeName]({
          color: isFocused ? Colors.tint : Colors.tabIconDefault,
          focused: isFocused,
        })}
      </Animated.View>

      <Animated.Text
        style={[
          styles.label,
          animatedLabelStyle,
          { color: isFocused ? Colors.tint : Colors.tabIconDefault },
        ]}
      >
        {label}
      </Animated.Text>

      {isFocused && (
        <Animated.View
          style={[styles.activeDot, { backgroundColor: Colors.tint }]}
        />
      )}
    </AnimatedPressable>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 8,
    paddingHorizontal: 4,
    position: "relative",
  },
  iconContainer: {
    marginBottom: 4,
    alignItems: "center",
    justifyContent: "center",
    width: 28,
    height: 28,
  },
  label: {
    fontSize: 12,
    fontWeight: "500",
    textAlign: "center",
    marginTop: 2,
  },
  activeDot: {
    position: "absolute",
    bottom: -8,
    width: 4,
    height: 4,
    borderRadius: 2,
    opacity: 0.8,
  },
});
