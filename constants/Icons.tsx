import { Ionicons } from "@expo/vector-icons";

const ICON_SIZE = 22;

export const icon = {
  index: ({ color, focused }: { color: string; focused: boolean }) =>
    <Ionicons name={focused ? "home" : "home-outline"} size={ICON_SIZE} color={color} />,

  discover: ({ color, focused }: { color: string; focused: boolean }) =>
    <Ionicons name={focused ? "compass" : "compass-outline"} size={ICON_SIZE} color={color} />,

  saved: ({ color, focused }: { color: string; focused: boolean }) =>
    <Ionicons name={focused ? "bookmarks" : "bookmarks-outline"} size={ICON_SIZE} color={color} />,

  profile: ({ color, focused }: { color: string; focused: boolean }) =>
    <Ionicons name={focused ? "person" : "person-outline"} size={ICON_SIZE} color={color} />,
};
