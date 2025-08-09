import { Tabs } from "expo-router";
import React from "react";
import { Platform } from "react-native";

import { HapticTab } from "@/components/HapticTab";
import TabBarBackground from "@/components/ui/TabBarBackground";
import theme from "@/styles/theme";
import { ChartBarOutline, ChartBarSolid, Cog6ToothOutline, Cog6ToothSolid, CogOutline, CogSolid, DevicePhoneMobileOutline, HomeOutline, HomeSolid } from "@/assets/icons/heroicons";

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: theme.colors.text,
        headerShown: false,
        // use if tab bar should have haptics
        tabBarButton: HapticTab,
        tabBarBackground: TabBarBackground,
        tabBarStyle: Platform.select({
          ios: {
            // Use a transparent background on iOS to show the blur effect
            position: "absolute",
          },
          default: {},
        }),
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: "Home",
          tabBarIcon: ({ color, focused }) => (
            focused ? <HomeSolid size={26} color={color} />
            : <HomeOutline size={26} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="stats"
        options={{
          title: "Stats",
          tabBarIcon: ({ color, focused }) => (
            focused ? <ChartBarSolid size={26} color={color} />
            : <ChartBarOutline size={26} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="focusZones"
        options={{
          title: "Focus Zones",
          tabBarIcon: ({ color, focused }) => (
            focused ? <DevicePhoneMobileOutline size={26} color={color} />
            : <DevicePhoneMobileOutline size={26} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="settings"
        options={{
          title: "Settings",
          tabBarIcon: ({ color, focused }) => (
            focused ? <Cog6ToothSolid size={26} color={color} />
            : <Cog6ToothOutline size={26} color={color} />
          ),
        }}
      />
    </Tabs>
  );
}
