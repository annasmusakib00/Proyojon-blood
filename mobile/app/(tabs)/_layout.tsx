import React from 'react';
import { Tabs } from 'expo-router';
import { Text, View, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../../constants/colors';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { BlurView } from 'expo-blur';

export default function TabLayout() {
  const insets = useSafeAreaInsets();
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          position: 'absolute',
          bottom: 8,
          left: 16,
          right: 16,
          elevation: 20,
          backgroundColor: 'transparent',
          borderTopWidth: 0,
          height: 64,
          paddingBottom: 0,
          paddingTop: 0,
          borderRadius: 32,
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 10 },
          shadowOpacity: 0.3,
          shadowRadius: 20,
        },
        tabBarBackground: () => (
          <View style={{ flex: 1, overflow: 'visible' }}>
            {/* Red curve overlaying behind the nav bar, merging with it */}
            <View style={{ position: 'absolute', top: 32, left: -16, right: -16, bottom: -50, backgroundColor: Colors.primary, borderTopLeftRadius: 24, borderTopRightRadius: 24 }} />
            <View style={{ flex: 1, borderRadius: 100, overflow: 'hidden', backgroundColor: '#FFF' }}>
              <View style={[StyleSheet.absoluteFill, { borderWidth: 1, borderColor: 'rgba(0,0,0,0.05)', borderRadius: 100 }]} />
            </View>
          </View>
        ),
        tabBarActiveTintColor: Colors.primary,
        tabBarInactiveTintColor: '#888888',
        tabBarActiveBackgroundColor: 'rgba(138, 3, 3, 0.08)',
        tabBarLabelStyle: {
          fontSize: 10,
          fontWeight: '700',
          marginBottom: 6,
          marginTop: 2,
          lineHeight: 12,
        },
        tabBarItemStyle: {
          borderRadius: 100, // perfect pill
          marginHorizontal: 4,
          marginVertical: 4,
          paddingTop: 6,
          paddingBottom: 2,
        },
      }}
    >
      <Tabs.Screen
        name="dashboard"
        options={{
          title: 'হোম',
          tabBarIcon: ({ color, focused }) => (
            <Ionicons name={focused ? 'home' : 'home-outline'} size={24} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="request"
        options={{
          title: 'আবেদন',
          tabBarIcon: ({ color, focused }) => (
            <Ionicons name={focused ? 'water' : 'water-outline'} size={24} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="donors"
        options={{
          title: 'ডোনার',
          tabBarIcon: ({ color, focused }) => (
            <Ionicons name={focused ? 'heart' : 'heart-outline'} size={24} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="history"
        options={{
          title: 'ইতিহাস',
          tabBarIcon: ({ color, focused }) => (
            <Ionicons name={focused ? 'document-text' : 'document-text-outline'} size={24} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: 'প্রোফাইল',
          tabBarIcon: ({ color, focused }) => (
            <Ionicons name={focused ? 'person' : 'person-outline'} size={24} color={color} />
          ),
        }}
      />
    </Tabs>
  );
}

const styles = StyleSheet.create({});
