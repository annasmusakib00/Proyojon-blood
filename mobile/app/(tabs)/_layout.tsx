import React, { useEffect, useRef } from 'react';
import { Tabs, usePathname } from 'expo-router';
import { Text, View, StyleSheet, Animated, TouchableOpacity, Easing } from 'react-native';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { Colors } from '../../constants/colors';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { BlurView } from 'expo-blur';
import { useLocaleStore } from '../../stores/localeStore';
import { t } from '../../utils/i18n';

const RadarButton = ({ children, onPress, locale }: any) => {
  const spinValue = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // A very long continuous animation to avoid any reset stuttering
    Animated.timing(spinValue, {
      toValue: 10000,
      duration: 2500 * 10000, // 2.5 seconds per 360 degrees
      easing: Easing.linear,
      useNativeDriver: true,
    }).start();
  }, [spinValue]);

  const spin = spinValue.interpolate({
    inputRange: [0, 10000],
    outputRange: ['0deg', '3600000deg'],
  });

  return (
    <TouchableOpacity
      style={styles.customRadarButton}
      onPress={onPress}
      activeOpacity={0.8}
    >
      <View style={styles.requestButtonCenterCircle}>
        <View style={styles.requestButtonInnerCircle}>
          <Animated.View style={{ transform: [{ rotate: spin }] }}>
            <MaterialCommunityIcons name="radar" size={54} color={Colors.primary} />
          </Animated.View>
        </View>
      </View>
      <Text style={styles.radarButtonText}>
        {locale === 'en' ? 'Radar' : 'রাডার'}
      </Text>
    </TouchableOpacity>
  );
};

export default function TabLayout() {
  const { locale } = useLocaleStore();
  const insets = useSafeAreaInsets();
  const pathname = usePathname();
  const isRequestActive = pathname.startsWith('/request') || pathname.startsWith('/create-post');

  const commonTabItemStyle: any = {
    borderRadius: 100,
    marginHorizontal: 4,
    marginVertical: 4,
    paddingTop: 6,
    paddingBottom: 2,
  };

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          position: 'absolute',
          bottom: 16, // SafeAreaView at root handles the bottom inset
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
            {/* Flat red background like the top header, letting the white nav bar overlap it */}
            <View style={{ position: 'absolute', top: 32, left: -16, right: -16, bottom: -150, backgroundColor: Colors.primary }} />
            <View style={{ flex: 1, borderRadius: 100, overflow: 'hidden', backgroundColor: '#FFF', elevation: 8, shadowColor: '#000', shadowOffset: { width: 0, height: -4 }, shadowOpacity: 0.12, shadowRadius: 10 }}>
              <View style={[StyleSheet.absoluteFill, { borderWidth: 1, borderColor: 'rgba(0,0,0,0.05)', borderRadius: 100 }]} />
            </View>
          </View>
        ),
        tabBarActiveTintColor: Colors.primary,
        tabBarInactiveTintColor: '#888888',
        tabBarActiveBackgroundColor: 'transparent', // Make active background transparent
        tabBarLabelStyle: {
          fontSize: 10,
          fontWeight: '700',
          marginBottom: 6,
          marginTop: 2,
          lineHeight: 12,
        },
        tabBarItemStyle: commonTabItemStyle,
      }}
    >
      <Tabs.Screen
        name="dashboard"
        options={{
          title: t('tabs.home'),
          tabBarIcon: ({ color, focused }) => (
            <Ionicons name={focused ? 'home' : 'home-outline'} size={24} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="request"
        options={{
          title: '',
          tabBarItemStyle: isRequestActive ? { display: 'none' } : commonTabItemStyle,
          tabBarButton: (props) => (
            <RadarButton {...props} locale={locale} />
          ),
        }}
      />
      <Tabs.Screen
        name="history"
        options={{
          title: t('tabs.history'),
          tabBarItemStyle: isRequestActive ? commonTabItemStyle : { display: 'none' },
          tabBarIcon: ({ color, focused }) => (
            <Ionicons name={focused ? 'document-text' : 'document-text-outline'} size={24} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="donors"
        options={{
          title: t('tabs.donors'),
          tabBarIcon: ({ color, focused }) => (
            <Ionicons name={focused ? 'water' : 'water-outline'} size={24} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          href: null,
        }}
      />
      <Tabs.Screen
        name="create-post"
        options={{
          href: null,
        }}
      />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  customRadarButton: {
    top: -22,
    justifyContent: 'center',
    alignItems: 'center',
    flex: 1,
  },
  requestButtonCenterCircle: {
    width: 86, 
    height: 86,
    borderRadius: 43,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 12, // Stronger 3D shadow
    shadowColor: Colors.primaryDark || '#8a0303', // Colored shadow for glow
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.4,
    shadowRadius: 10,
    borderWidth: 4,
    borderColor: '#FFF5F5', // Light rim
  },
  requestButtonInnerCircle: {
    width: 68,
    height: 68,
    borderRadius: 34,
    backgroundColor: 'rgba(138, 3, 3, 0.06)', // Light red tint
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(138, 3, 3, 0.15)', // Subtle inner ring
  },
  radarButtonText: {
    color: '#FFF',
    fontSize: 10,
    fontWeight: '700',
    marginTop: 2,
    textAlign: 'center',
    textShadowColor: 'rgba(0,0,0,0.5)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
});
