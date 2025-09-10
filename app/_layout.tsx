// app/_layout.tsx
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { View } from 'react-native';
import { useAppTheme } from '@/providers/ThemeProvider';

export default function AppShell() {
  const { theme } = useAppTheme();
  return (
      <View style={{ flex: 1, backgroundColor: theme.bg }}>
      <StatusBar style={theme.name === 'dark' ? 'light' : 'dark'} translucent />
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="splash" />
        <Stack.Screen name="(tabs)" />
        <Stack.Screen name="detail" />
      </Stack>
    </View>
  );
}
