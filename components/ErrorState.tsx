// components/ErrorState.tsx
import React from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { useAppTheme } from '@/providers/ThemeProvider';

type Props = { title: string; message?: string; onRetry?: () => void };

export default function ErrorState({ title, message, onRetry }: Props) {
  const { theme } = useAppTheme();

  return (
    <View style={[styles.wrap, { paddingHorizontal: 16 }]}>
      <View
        style={[
          styles.card,
          {
            backgroundColor: theme.card,
            borderColor: theme.hairline,
            shadowOpacity: theme.name === 'dark' ? 0.25 : 0.1,
          },
        ]}
      >
        <Text style={[styles.title, { color: theme.text }]}>{title}</Text>
        {!!message && (
          <Text style={[styles.msg, { color: theme.textSecondary }]}>{message}</Text>
        )}

        {onRetry && (
          <Pressable
            onPress={onRetry}
            style={[styles.btn, { backgroundColor: theme.tint }]}
          >
            <Text style={styles.btnTxt}>Retry</Text>
          </Pressable>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { paddingVertical: 10 },
  card: {
    borderRadius: 18,
    padding: 16,
    borderWidth: StyleSheet.hairlineWidth,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowRadius: 12,
    elevation: 3,
  },
  title: { fontSize: 18, fontWeight: '800', marginBottom: 6, textAlign: 'center' },
  msg: { fontSize: 14, textAlign: 'center' },
  btn: {
    alignSelf: 'center',
    marginTop: 14,
    paddingHorizontal: 18,
    paddingVertical: 10,
    borderRadius: 12,
  },
  btnTxt: { color: '#fff', fontWeight: '700' },
});
