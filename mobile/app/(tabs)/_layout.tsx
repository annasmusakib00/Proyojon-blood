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
          bottom: 16,
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
          <View style={{ flex: 1, borderRadius: 32, overflow: 'hidden', backgroundColor: 'rgba(255, 255, 255, 0.85)' }}>
            <BlurView tint="light" intensity={80} style={StyleSheet.absoluteFillObject} />
            <View style={{ ...StyleSheet.absoluteFillObject, borderWidth: 1, borderColor: 'rgba(0,0,0,0.05)', borderRadius: 32 }} />
          </View>
        ),
        tabBarActiveTintColor: Colors.primary,
        tabBarInactiveTintColor: Colors.textMuted,
        tabBarActiveBackgroundColor: Colors.primaryGhost,
        tabBarLabelStyle: {
          fontSize: 10,
          fontWeight: '700',
          marginBottom: 8,
        },
        tabBarItemStyle: {
          paddingTop: 8,
          borderRadius: 20,
          margin: 4,
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
          tabBarIcon: ({ focused }) => (
            <View style={[styles.centerTab, focused && styles.centerTabActive]}>
              <Ionicons name={focused ? 'heart' : 'heart-outline'} size={24} color={focused ? Colors.primary : Colors.textMuted} />
            </View>
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

const styles = StyleSheet.create({
  centerTab: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.05)',
  },
  centerTabActive: {
    backgroundColor: Colors.primaryGhost,
    borderColor: 'rgba(138, 3, 3, 0.2)',
    elevation: 8,
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
  },
});
