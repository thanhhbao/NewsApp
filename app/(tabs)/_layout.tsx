import React from 'react'
import { Tabs } from 'expo-router'
import { TabBar } from '@/components/TabBar'
import 'react-native-reanimated';

const TabLayout = () => {
  return (
    <Tabs tabBar={(props) => <TabBar {...props} />} screenOptions={{headerShown:false}}>
      <Tabs.Screen
        name="index"
        options={{
          title: "Trang chủ",
        }}
      />
      <Tabs.Screen
        name="discover"
        options={{
          title: "Khám phá",
        }}
      />
      <Tabs.Screen
        name="saved"
        options={{
          title: "Đã lưu",
        }}
      />
      <Tabs.Screen
        name="settings"
        options={{
          title: "Cài đặt",
        }}
      />
    </Tabs>
  )
}

export default TabLayout