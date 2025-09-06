// Header.tsx
import React from 'react';
import { View, Text, StyleSheet, Pressable, TextInput } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';

export default function Header() {
  const { top } = useSafeAreaInsets();

  return (
    <>
      {/* Header với glass effect */}
      <View style={[styles.headerContainer]}>
        <View style={styles.header}>
          {/* Nút menu với glass effect */}
          <Pressable style={styles.glassIconBtn}>
            <Ionicons name="menu" size={22} color="#374151" />
          </Pressable>

          <View style={styles.rightGroup}>
            {/* Chip nhiệt độ với glass effect */}
            <Pressable style={styles.glassChip}>
              <Ionicons name="sunny-outline" size={16} color="#F59E0B" />
              <Text style={styles.chipText}>55°F</Text>
              <Ionicons name="chevron-down" size={16} color="#6B7280" />
            </Pressable>

            {/* Chuông với glass effect + chấm đỏ */}
            <Pressable style={[styles.glassIconBtn, { position: 'relative' }]}>
              <Ionicons name="notifications-outline" size={22} color="#374151" />
              <View style={styles.glowDot} />
            </Pressable>
          </View>
        </View>
      </View>

      {/* Search bar với glass effect */}
      <View style={styles.searchContainer}>
        <View style={styles.glassSearchBar}>
          <Ionicons 
            name="search-outline" 
            size={20} 
            color="#6B7280" 
            style={styles.searchIcon} 
          />
          <TextInput 
            placeholder='Tìm kiếm tin tức mới nhất...'
            style={styles.searchInput}
            placeholderTextColor="#9CA3AF"
          />
          <Pressable style={styles.filterBtn}>
            <Ionicons name="options-outline" size={18} color="#6B7280" />
          </Pressable>
        </View>
      
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  headerContainer: {
    backgroundColor: 'rgba(255, 255, 255, 0.25)',
    backdropFilter: 'blur(20px)',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.2)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 8,
  },
  
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingBottom: 12,
  },
  
  rightGroup: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    columnGap: 12 
  },
  
  glassIconBtn: {
    padding: 12,
    borderRadius: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.4)',
    backdropFilter: 'blur(10px)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.3)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  
  glassChip: {
    flexDirection: 'row',
    alignItems: 'center',
    columnGap: 8,
    paddingHorizontal: 16,
    paddingVertical: 10,
    backgroundColor: 'rgba(255, 255, 255, 0.5)',
    backdropFilter: 'blur(15px)',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.4)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.12,
    shadowRadius: 10,
    elevation: 6,
  },
  
  chipText: { 
    fontWeight: '600',
    fontSize: 14,
    color: '#374151',
  },
  
  glowDot: {
    position: 'absolute',
    top: 8,
    right: 8,
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#EF4444',
    borderWidth: 2,
    borderColor: 'rgba(255, 255, 255, 0.9)',
    shadowColor: '#EF4444',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 4,
    elevation: 3,
  },
  
  searchContainer: {
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: 'rgba(248, 250, 252, 0.3)',
  },
  
  glassSearchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.6)',
    backdropFilter: 'blur(20px)',
    borderRadius: 16,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.4)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 6,
  },
  
  searchIcon: {
    marginRight: 12,
  },
  
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: '#374151',
    fontWeight: '500',
  },
  
  filterBtn: {
    padding: 8,
    borderRadius: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.4)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.3)',
    marginLeft: 8,
  },
});