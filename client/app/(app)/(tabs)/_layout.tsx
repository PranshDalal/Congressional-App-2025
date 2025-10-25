import { Tabs, useRouter } from "expo-router";
import React from "react";
import { Platform, Image } from "react-native";

import { HapticTab } from "@/components/navigation/HapticTab";
import TabBarBackground from "@/components/ui/TabBarBackground";
import theme from "@/styles/theme";
import {
  ChartBarOutline,
  ChartBarSolid,
  Cog6ToothOutline,
  Cog6ToothSolid,
  DevicePhoneMobileOutline,
  DevicePhoneMobileSolid,
  HomeOutline,
  HomeSolid,
  UserCircleOutline,
} from "@/assets/icons/heroicons";
import { headerPreset } from "@/components/navigation/Header";
import { getAuth } from "@react-native-firebase/auth";
import ThemedText from "@/components/ThemedText";
import IconButton from "@/components/button/IconButton";
import globalStyles from "@/styles/globalStyles";
import { View } from "moti";
import SizedBox from "@/components/SizedBox";

export default function TabLayout() {
  const user = getAuth().currentUser;
  const router = useRouter();

  return (
    <Tabs
      screenOptions={{
        ...headerPreset,
        tabBarActiveTintColor: theme.colors.text,
        tabBarButton: HapticTab,
        tabBarBackground: TabBarBackground,
        tabBarStyle: Platform.select({
          ios: {
            position: "absolute",
          },
          default: {},
        }),
        tabBarShowLabel: false,
        tabBarIconStyle: {
          paddingTop: 10,
          height: 60,
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          headerStyle: {
            height: 120,
          },
          headerTitle: () => (
            <View
              style={{
                flexDirection: "row",
                alignItems: "center",
                paddingHorizontal: theme.spacing.sm,
              }}
            >
              <Image
                source={require("@/assets/icons/ios-dark.png")}
                style={{ width: 40, height: 40, marginRight: theme.spacing.md }}
                resizeMode="contain"
              />
              <ThemedText style={globalStyles.header1}>Attune</ThemedText>
            </View>
            // <ThemedText style={globalStyles.header1}>
            //   {`Welcome back${
            //     user?.displayName ? ", " + user.displayName : ""
            //   }`}
            // </ThemedText>
          ),
          tabBarIcon: ({ color, focused }) =>
            focused ? (
              <HomeSolid size={28} color={color} />
            ) : (
              <HomeOutline size={28} color={color} />
            ),
          headerRight: () => (
            <IconButton
              color="#a75cff"
              size={28}
              icon={<UserCircleOutline />}
              onPress={() => {
                router.push("/settings");
              }}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="stats"
        options={{
          title: "Stats",
          tabBarIcon: ({ color, focused }) =>
            focused ? (
              <ChartBarSolid size={28} color={color} />
            ) : (
              <ChartBarOutline size={28} color={color} />
            ),
          // headerRight: () => (
          //   <DevicePhoneMobileOutline
          //     size={24}
          //     color={theme.colors.text}
          //     style={{ marginRight: 16 }}
          //   />
          // ),
        }}
      />
      <Tabs.Screen
        name="focusZones"
        options={{
          title: "Focus Zones",
          tabBarIcon: ({ color, focused }) =>
            focused ? (
              <DevicePhoneMobileSolid size={26} color={color} />
            ) : (
              <DevicePhoneMobileOutline size={26} color={color} />
            ),
          // headerRight: () => (
          //   <ChartBarOutline
          //     size={24}
          //     color={theme.colors.text}
          //     style={{ marginRight: 16 }}
          //   />
          // ),
        }}
      />
      <Tabs.Screen
        name="settings"
        options={{
          title: "Settings",
          tabBarIcon: ({ color, focused }) =>
            focused ? (
              <Cog6ToothSolid size={28} color={color} />
            ) : (
              <Cog6ToothOutline size={28} color={color} />
            ),
          // headerRight: () => (
          //   <HomeOutline
          //     size={24}
          //     color={theme.colors.text}
          //     style={{ marginRight: 16 }}
          //   />
          // ),
        }}
      />
    </Tabs>
  );
}
