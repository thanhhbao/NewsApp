// app/(tabs)/profile.tsx
import React, { useEffect, useMemo, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  SafeAreaView,
  Alert,
  Switch,
  Platform,
} from 'react-native';
import { BlurView } from 'expo-blur';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useAppTheme } from '@/providers/ThemeProvider';

type MenuItemId =
  | 'reading_history'
  | 'bookmarks'
  | 'offline_reading'
  | 'notifications'
  | 'dark_mode'
  | 'auto_read'
  | 'subscription'
  | 'privacy'
  | 'help'
  | 'rate'
  | 'share'
  | 'version';

const ProfileScreen = () => {
  const insets = useSafeAreaInsets();
  const { theme, toggleTheme } = useAppTheme();

  // đồng bộ công tắc Dark Mode với theme hiện tại
  const [darkMode, setDarkMode] = useState(theme.name === 'dark');
  const [notifications, setNotifications] = useState(true);
  const [autoRead, setAutoRead] = useState(false);
  const [avatarError, setAvatarError] = useState(false);

  useEffect(() => {
    setDarkMode(theme.name === 'dark');
  }, [theme.name]);

  const userStats = useMemo(
    () => ({
      articlesRead: 247,
      bookmarked: 18,
      following: 12,
      readingStreak: 7,
    }),
    []
  );

  const handleMenuPress = (itemId: MenuItemId) => {
    switch (itemId) {
      case 'reading_history':
        console.log('Navigate to Reading History');
        break;
      case 'bookmarks':
        console.log('Navigate to Bookmarks');
        break;
      case 'subscription':
        Alert.alert(
          'Premium Subscription',
          'Upgrade to Premium for unlimited access, offline reading, and ad-free experience!',
          [
            { text: 'Maybe Later', style: 'cancel' },
            { text: 'Upgrade Now', style: 'default' },
          ]
        );
        break;
      case 'rate':
        Alert.alert('Rate App', 'Redirect to App Store/Play Store');
        break;
      case 'share':
        Alert.alert('Share App', 'Share NewsApp with friends');
        break;
      default:
        console.log(`Pressed: ${itemId}`);
    }
  };

  const menuSections = useMemo(
    () => [
      {
        title: 'Reading',
        items: [
          {
            id: 'reading_history',
            title: 'Reading History',
            icon: 'book-outline',
            subtitle: `${userStats.articlesRead} articles read`,
            hasArrow: true,
          },
          {
            id: 'bookmarks',
            title: 'My Bookmarks',
            icon: 'bookmark-outline',
            subtitle: `${userStats.bookmarked} saved articles`,
            hasArrow: true,
          },
          {
            id: 'offline_reading',
            title: 'Offline Reading',
            icon: 'phone-portrait-outline',
            subtitle: 'Download articles for later',
            hasArrow: true,
          },
        ],
      },
      {
        title: 'Preferences',
        items: [
          {
            id: 'notifications',
            title: 'Push Notifications',
            icon: 'notifications-outline',
            subtitle: 'Breaking news & daily digest',
            hasSwitch: true,
            switchValue: notifications,
            onSwitchChange: setNotifications,
          },
          {
            id: 'dark_mode',
            title: 'Dark Mode',
            icon: 'moon-outline',
            subtitle: 'Easier on your eyes',
            hasSwitch: true,
            switchValue: darkMode,
            onSwitchChange: (v: boolean) => {
              setDarkMode(v);
              toggleTheme(v ? 'dark' : 'light');
            },
          },
          {
            id: 'auto_read',
            title: 'Auto-mark as Read',
            icon: 'checkmark-done-outline',
            subtitle: 'Mark articles as read when scrolled',
            hasSwitch: true,
            switchValue: autoRead,
            onSwitchChange: setAutoRead,
          },
        ],
      },
      {
        title: 'Account',
        items: [
          {
            id: 'subscription',
            title: 'Premium Subscription',
            icon: 'star',
            subtitle: 'Unlock premium features',
            hasArrow: true,
            isPremium: true,
          },
          {
            id: 'privacy',
            title: 'Privacy Settings',
            icon: 'lock-closed-outline',
            subtitle: 'Manage your data',
            hasArrow: true,
          },
          {
            id: 'help',
            title: 'Help & Support',
            icon: 'help-circle-outline',
            subtitle: 'FAQs and contact us',
            hasArrow: true,
          },
        ],
      },
      {
        title: 'About',
        items: [
          {
            id: 'rate',
            title: 'Rate App',
            icon: 'star-outline',
            subtitle: 'Love the app? Rate us!',
            hasArrow: true,
          },
          {
            id: 'share',
            title: 'Share App',
            icon: 'share-outline',
            subtitle: 'Tell friends about NewsApp',
            hasArrow: true,
          },
          {
            id: 'version',
            title: 'App Version',
            icon: 'information-circle-outline',
            subtitle: '2.1.0 (Latest)',
            hasArrow: false,
          },
        ],
      },
    ],
    [userStats, notifications, darkMode, autoRead, toggleTheme]
  );

  const renderMenuItem = (item: any) => (
    <TouchableOpacity
      key={item.id}
      style={styles.menuItem}
      onPress={() => handleMenuPress(item.id as MenuItemId)}
      disabled={item.hasSwitch}
      activeOpacity={item.hasSwitch ? 1 : 0.7}
    >
      <View style={styles.menuItemLeft}>
        <View
          style={[
            styles.iconContainer,
            item.isPremium && styles.premiumIcon,
            { backgroundColor: theme.name === 'dark' ? 'rgba(148,163,184,0.12)' : '#F0F0F0' },
          ]}
        >
          <Ionicons
            name={item.icon as any}
            size={20}
            color={item.isPremium ? '#7C2D12' : theme.textSecondary}
          />
        </View>
        <View style={styles.menuTextContainer}>
          <Text style={[styles.menuTitle, { color: theme.text }]}>{item.title}</Text>
          <Text style={[styles.menuSubtitle, { color: theme.textSecondary }]}>{item.subtitle}</Text>
        </View>
      </View>

      <View style={styles.menuItemRight}>
        {item.hasSwitch && (
          <Switch
            value={item.switchValue}
            onValueChange={item.onSwitchChange}
            trackColor={{
              false: theme.name === 'dark' ? 'rgba(148,163,184,0.25)' : '#E5E7EB',
              true: theme.tint,
            }}
            thumbColor={Platform.OS === 'android' ? '#fff' : undefined}
          />
        )}
        {item.hasArrow && (
          <Ionicons name="chevron-forward" size={18} color={theme.name === 'dark' ? '#6B7280' : '#C7C7CC'} />
        )}
      </View>
    </TouchableOpacity>
  );

  const bottomPad = insets.bottom + 96;

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.bg, paddingTop: insets.top }]}>
      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: bottomPad }}
      >
        {/* Header */}
        <View style={styles.header}>
          <Text style={[styles.title, { color: theme.text }]}>Profile</Text>
        </View>

        {/* Profile Card */}
        <BlurView
          intensity={28}
          tint={theme.name === 'dark' ? 'dark' : 'light'}
          experimentalBlurMethod={Platform.OS === 'android' ? 'dimezisBlurView' : undefined}
          style={[
            styles.profileCard,
            {
              backgroundColor: theme.name === 'dark' ? 'rgba(30,41,59,0.45)' : 'rgba(255,255,255,0.7)',
              borderColor: theme.name === 'dark' ? 'rgba(255,255,255,0.12)' : 'rgba(255,255,255,0.45)',
            },
          ]}
        >
          <View style={styles.profileInfo}>
            <View style={styles.avatarContainer}>
              {avatarError ? (
                <View style={[styles.avatar, styles.avatarFallback]}>
                  <Text style={[styles.avatarFallbackText, { color: '#fff' }]}>J</Text>
                </View>
              ) : (
                <Image
                  source={{
                    uri: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face',
                  }}
                  style={styles.avatar}
                  onError={() => setAvatarError(true)}
                />
              )}
              <View style={[styles.onlineIndicator, { borderColor: theme.name === 'dark' ? '#0B1220' : '#fff' }]} />
            </View>

            <View style={styles.userInfo}>
              <Text style={[styles.userName, { color: theme.text }]}>John Doe</Text>
              <Text style={[styles.userEmail, { color: theme.textSecondary }]}>john.doe@email.com</Text>
              <View style={styles.badgeContainer}>
                <View
                  style={[
                    styles.badge,
                    { backgroundColor: theme.tint, shadowColor: theme.tint },
                  ]}
                >
                  <Text style={styles.badgeText}>Premium</Text>
                </View>
                <View style={[styles.badge, styles.streakBadge]}>
                  <Text style={styles.badgeText}>{userStats.readingStreak} days</Text>
                </View>
              </View>
            </View>

            <TouchableOpacity
              style={[styles.editButton, { backgroundColor: theme.tint, shadowColor: theme.tint }]}
            >
              <Text style={styles.editButtonText}>Edit</Text>
            </TouchableOpacity>
          </View>
        </BlurView>

        {/* Stats Card */}
        <BlurView
          intensity={22}
          tint={theme.name === 'dark' ? 'dark' : 'light'}
          experimentalBlurMethod={Platform.OS === 'android' ? 'dimezisBlurView' : undefined}
          style={[
            styles.statsCard,
            {
              backgroundColor: theme.name === 'dark' ? 'rgba(30,41,59,0.42)' : 'rgba(255,255,255,0.7)',
              borderColor: theme.name === 'dark' ? 'rgba(255,255,255,0.12)' : 'rgba(255,255,255,0.45)',
            },
          ]}
        >
          <Text style={[styles.statsTitle, { color: theme.text }]}>Reading Stats</Text>
          <View style={styles.statsGrid}>
            <View style={styles.statItem}>
              <Text style={[styles.statNumber, { color: theme.tint }]}>{userStats.articlesRead}</Text>
              <Text style={[styles.statLabel, { color: theme.textSecondary }]}>Articles Read</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={[styles.statNumber, { color: theme.tint }]}>{userStats.bookmarked}</Text>
              <Text style={[styles.statLabel, { color: theme.textSecondary }]}>Bookmarked</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={[styles.statNumber, { color: theme.tint }]}>{userStats.following}</Text>
              <Text style={[styles.statLabel, { color: theme.textSecondary }]}>Following</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={[styles.statNumber, { color: theme.tint }]}>{userStats.readingStreak}</Text>
              <Text style={[styles.statLabel, { color: theme.textSecondary }]}>Day Streak</Text>
            </View>
          </View>
        </BlurView>

        {/* Menu Sections */}
        {menuSections.map((section, sectionIndex) => (
          <View key={sectionIndex} style={styles.section}>
            <Text style={[styles.sectionTitle, { color: theme.text }]}>{section.title}</Text>
            <BlurView
              intensity={20}
              tint={theme.name === 'dark' ? 'dark' : 'light'}
              experimentalBlurMethod={Platform.OS === 'android' ? 'dimezisBlurView' : undefined}
              style={[
                styles.menuCard,
                {
                  backgroundColor: theme.name === 'dark' ? 'rgba(30,41,59,0.4)' : 'rgba(255,255,255,0.7)',
                  borderColor: theme.name === 'dark' ? 'rgba(255,255,255,0.12)' : 'rgba(255,255,255,0.45)',
                },
              ]}
            >
              {section.items.map((item: any, itemIndex: number) => (
                <View key={item.id}>
                  {renderMenuItem(item)}
                  {itemIndex < section.items.length - 1 && (
                    <View
                      style={[
                        styles.separator,
                        { backgroundColor: theme.name === 'dark' ? 'rgba(148,163,184,0.18)' : 'rgba(0,0,0,0.08)' },
                      ]}
                    />
                  )}
                </View>
              ))}
            </BlurView>
          </View>
        ))}

        {/* Logout Button */}
        <TouchableOpacity
          style={[styles.logoutButton, { backgroundColor: '#FF3B30', shadowColor: '#FF3B30' }]}
          onPress={() =>
            Alert.alert('Logout', 'Are you sure you want to logout?', [
              { text: 'Cancel', style: 'cancel' },
              { text: 'Logout', style: 'destructive' },
            ])
          }
        >
          <Text style={styles.logoutText}>Sign Out</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
};

export default ProfileScreen;

const R = 20;

const styles = StyleSheet.create({
  container: { flex: 1 },
  scrollView: { flex: 1 },

  header: { paddingHorizontal: 20, paddingTop: 10, paddingBottom: 20 },
  title: { fontSize: 32, fontWeight: '800' },

  // Glass cards
  profileCard: {
    marginHorizontal: 20,
    borderRadius: R,
    padding: 20,
    marginBottom: 20,
    overflow: 'hidden', // để kính + borderRadius bo tròn thật
    borderWidth: 0.75,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.10,
    shadowRadius: 12,
    elevation: 6,
  },
  statsCard: {
    marginHorizontal: 20,
    borderRadius: R,
    padding: 20,
    marginBottom: 24,
    overflow: 'hidden',
    borderWidth: 0.75,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 4,
  },

  profileInfo: { flexDirection: 'row', alignItems: 'center' },
  avatarContainer: { position: 'relative', marginRight: 16 },
  avatar: { width: 70, height: 70, borderRadius: 35, backgroundColor: '#ddd' },
  avatarFallback: { backgroundColor: '#94A3B8', alignItems: 'center', justifyContent: 'center' },
  avatarFallbackText: { fontSize: 24, fontWeight: '800' },
  onlineIndicator: {
    position: 'absolute',
    bottom: 2,
    right: 2,
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: '#22C55E',
    borderWidth: 2,
  },

  userInfo: { flex: 1 },
  userName: { fontSize: 20, fontWeight: '800', marginBottom: 4 },
  userEmail: { fontSize: 14, marginBottom: 8 },
  badgeContainer: { flexDirection: 'row', gap: 8 },
  badge: {
    backgroundColor: '#007AFF',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.18,
    shadowRadius: 6,
    elevation: 2,
  },
  streakBadge: { backgroundColor: '#FF6B35' },
  badgeText: { color: '#fff', fontSize: 11, fontWeight: '700' },
  editButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  editButtonText: { color: '#fff', fontSize: 14, fontWeight: '700' },

  statsTitle: { fontSize: 18, fontWeight: '800', marginBottom: 16, textAlign: 'center' },
  statsGrid: { flexDirection: 'row', justifyContent: 'space-around' },
  statItem: { alignItems: 'center' },
  statNumber: { fontSize: 24, fontWeight: '800' },
  statLabel: { fontSize: 12 },

  section: { marginBottom: 24 },
  sectionTitle: { fontSize: 18, fontWeight: '800', paddingHorizontal: 20, marginBottom: 12 },
  menuCard: {
    marginHorizontal: 20,
    borderRadius: 16,
    overflow: 'hidden',
    borderWidth: 0.75,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 3,
  },

  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 16,
    paddingHorizontal: 16,
  },
  menuItemLeft: { flexDirection: 'row', alignItems: 'center', flex: 1 },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  premiumIcon: { backgroundColor: '#FFD700' },
  menuTextContainer: { flex: 1 },
  menuTitle: { fontSize: 16, fontWeight: '700', marginBottom: 2 },
  menuSubtitle: { fontSize: 13 },
  menuItemRight: { alignItems: 'center', justifyContent: 'center' },
  separator: { height: 0.75, marginLeft: 68 },

  logoutButton: {
    marginHorizontal: 20,
    marginTop: 8,
    marginBottom: 24,
    borderRadius: 16,
    paddingVertical: 16,
    alignItems: 'center',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  logoutText: { color: '#fff', fontSize: 16, fontWeight: '700' },
});
