import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, SafeAreaView, ImageBackground, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import { Colors } from '../../constants/colors';
import { Ionicons } from '@expo/vector-icons';
import { t } from '../../utils/i18n';
import { useLocaleStore } from '../../stores/localeStore';
import * as Haptics from 'expo-haptics';

export default function WelcomeScreen() {
  const router = useRouter();
  const { locale, toggleLocale } = useLocaleStore();

  const handleRegister = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    router.push('/(auth)/register');
  };

  const handleLogin = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    router.push('/(auth)/login');
  };

  return (
    <View style={styles.container}>
      {/* Bottom overlay for creator credit */}
      <View style={styles.bottomOverlay}>
        <Text style={styles.madeByText}>Made by AN NASMU SAKIB</Text>
      </View>

      {/* Top Section - White Background with Transparent Image Texture */}
      <ImageBackground 
        source={require('../../assets/images/header-bg.jpg')}
        style={styles.topHalf}
        imageStyle={styles.topHalfImage}
      >
        <SafeAreaView style={styles.safeArea}>
          <TouchableOpacity style={styles.langToggle} onPress={toggleLocale}>
            <Ionicons name="globe-outline" size={18} color={Colors.primary} />
            <Text style={styles.langToggleText}>{locale === 'en' ? 'EN' : 'BN'}</Text>
          </TouchableOpacity>

          <Text style={styles.title}>{t('welcome.title')}</Text>
          <Text style={styles.tagline}>{t('welcome.tagline')}</Text>
          <View style={styles.iconContainer}>
            <View style={{ flex: 1, alignItems: 'flex-end', paddingRight: 10 }}>
              <Text style={styles.sideText}>{t('welcome.giveBlood')}</Text>
            </View>
            <Ionicons name="water" size={115} color={Colors.primary} style={styles.icon} />
            <View style={{ flex: 1, alignItems: 'flex-start', paddingLeft: 10 }}>
              <Text style={styles.sideText}>{t('welcome.saveLife')}</Text>
            </View>
          </View>
        </SafeAreaView>
      </ImageBackground>

      {/* Floating White Sheet with Transparent 3D Buttons & Powered By Text */}
      <View style={styles.bottomSheetWrapper}>
        <ImageBackground 
          source={require('../../assets/images/body-bg.jpg')}
          style={styles.bottomHalf}
          imageStyle={{ opacity: 0.04, resizeMode: 'cover' }}
        >
          <ScrollView contentContainerStyle={styles.bottomHalfScroll} showsVerticalScrollIndicator={false}>
          {/* Register Button (3D Red Glass, Rounded Corners) */}
          <TouchableOpacity
            style={styles.registerButton}
            onPress={handleRegister}
            activeOpacity={0.8}
          >
            <Text style={styles.registerButtonText}>{t('welcome.register')}</Text>
          </TouchableOpacity>

          {/* Login Button (3D Transparent Glass, Rounded Corners) */}
          <TouchableOpacity
            style={styles.loginButton}
            onPress={handleLogin}
            activeOpacity={0.8}
          >
            <Text style={styles.loginButtonText}>{t('welcome.login')}</Text>
          </TouchableOpacity>

          {/* Check This Out Button (3D Transparent Glass Outline, Rounded Corners) */}
          <TouchableOpacity
            style={styles.checkThisOutButton}
            onPress={() => router.push('/(auth)/onboarding')}
            activeOpacity={0.8}
          >
            <Text style={styles.checkThisOutButtonText}>{t('welcome.checkThisOut')}</Text>
          </TouchableOpacity>

          {/* Powered by PROYOJON text under all buttons */}
          <View style={styles.poweredByContainer}>
            <Text style={styles.poweredByText}>Powered by <Text style={styles.poweredByBrand}>PROYOJON</Text></Text>
          </View>
          </ScrollView>
        </ImageBackground>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  topHalf: {
    flex: 1.1,
    backgroundColor: '#FFFFFF',
    overflow: 'hidden',
  },
  topHalfImage: {
    opacity: 0.08,
    resizeMode: 'cover',
  },
  langToggle: {
    position: 'absolute',
    top: 50,
    right: 20,
    flexDirection: 'row', 
    alignItems: 'center', 
    gap: 6,
    paddingHorizontal: 12, 
    paddingVertical: 6,
    backgroundColor: 'rgba(138, 3, 3, 0.08)', 
    borderWidth: 1,
    borderColor: 'rgba(138, 3, 3, 0.2)',
    borderRadius: 20,
    zIndex: 10,
  },
  langToggleText: { 
    color: Colors.primary, 
    fontSize: 13, 
    fontWeight: '700' 
  },
  safeArea: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 30,
    paddingTop: 30,
  },
  title: {
    color: Colors.primary,
    fontSize: 34,
    fontWeight: '900',
    marginBottom: 6,
    textAlign: 'center',
    letterSpacing: 1,
  },
  tagline: {
    color: Colors.textSecondary,
    fontSize: 15,
    fontWeight: '600',
    marginBottom: 14,
    textAlign: 'center',
    lineHeight: 24,
  },
  iconContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: '100%',
    marginTop: 4,
  },
  icon: {
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
  },
  sideText: {
    color: Colors.primary,
    fontSize: 17,
    fontWeight: '800',
  },
  bottomSheetWrapper: {
    flex: 1,
    marginTop: -26,
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 36,
    borderTopRightRadius: 36,
    shadowColor: Colors.primaryDark,
    shadowOffset: { width: 0, height: -6 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 12,
    overflow: 'hidden',
    zIndex: 5,
  },
  bottomHalf: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  bottomHalfScroll: {
    flexGrow: 1,
    justifyContent: 'flex-start',
    paddingTop: 48,
    paddingBottom: 60,
    paddingHorizontal: 30,
  },
  bottomOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 24,
    backgroundColor: Colors.primary,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    zIndex: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  madeByText: {
    color: 'rgba(255,255,255,0.9)',
    fontSize: 9,
    fontWeight: '700',
    letterSpacing: 1,
  },
  registerButton: {
    backgroundColor: 'rgba(138, 3, 3, 0.15)',
    paddingVertical: 14,
    marginHorizontal: 10,
    borderRadius: 26,
    alignItems: 'center',
    marginBottom: 14,
    borderWidth: 1.5,
    borderColor: 'rgba(138, 3, 3, 0.5)',
    borderBottomWidth: 4,
    borderBottomColor: 'rgba(138, 3, 3, 0.7)',
  },
  registerButtonText: {
    color: Colors.primary,
    fontSize: 16,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  loginButton: {
    backgroundColor: 'rgba(138, 3, 3, 0.1)',
    paddingVertical: 14,
    marginHorizontal: 10,
    borderRadius: 26,
    alignItems: 'center',
    marginBottom: 14,
    borderWidth: 1.5,
    borderColor: 'rgba(138, 3, 3, 0.25)',
    borderBottomWidth: 4,
    borderBottomColor: 'rgba(138, 3, 3, 0.35)',
  },
  loginButtonText: {
    color: Colors.primary,
    fontSize: 16,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  checkThisOutButton: {
    backgroundColor: 'rgba(138, 3, 3, 0.05)',
    paddingVertical: 12,
    marginHorizontal: 30,
    borderRadius: 26,
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: 'rgba(138, 3, 3, 0.15)',
    borderBottomWidth: 3,
    borderBottomColor: 'rgba(138, 3, 3, 0.25)',
  },
  checkThisOutButtonText: {
    color: Colors.primary,
    fontSize: 14,
    fontWeight: '800',
    letterSpacing: 0.3,
  },
  poweredByContainer: {
    alignItems: 'center',
    marginTop: 20,
  },
  poweredByText: {
    color: Colors.textMuted,
    fontSize: 12,
    fontWeight: '600',
    letterSpacing: 0.8,
    textTransform: 'uppercase',
  },
  poweredByBrand: {
    color: Colors.primary,
    fontWeight: '800',
  },
});
