import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Dimensions, SafeAreaView, ImageBackground } from 'react-native';
import { useRouter } from 'expo-router';
import { Colors } from '../../constants/colors';
import { Ionicons } from '@expo/vector-icons';
import { t } from '../../utils/i18n';
import { useLocaleStore } from '../../stores/localeStore';
import * as Haptics from 'expo-haptics';

const { height } = Dimensions.get('window');

export default function WelcomeScreen() {
  const router = useRouter();
  const { locale } = useLocaleStore(); // to trigger re-renders on locale change

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
      {/* Bottom overlay as requested */}
      <View style={styles.bottomOverlay} />

      {/* Top Half - Red Theme Overlay with Image */}
      <ImageBackground 
        source={require('../../assets/images/header-bg.jpg')}
        style={styles.topHalf}
        imageStyle={styles.topHalfImage}
      >
        <SafeAreaView style={styles.safeArea}>
          <Text style={styles.tagline}>{t('welcome.tagline')}</Text>
          <View style={styles.iconContainer}>
            <Ionicons name="water" size={160} color="#FFFFFF" style={styles.icon} />
          </View>
        </SafeAreaView>
      </ImageBackground>

      {/* Bottom Half - White Space with Buttons */}
      <View style={styles.bottomHalf}>
        <TouchableOpacity
          style={styles.registerButton}
          onPress={handleRegister}
          activeOpacity={0.8}
        >
          <Text style={styles.registerButtonText}>{t('welcome.register')}</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.loginButton}
          onPress={handleLogin}
          activeOpacity={0.8}
        >
          <Text style={styles.loginButtonText}>{t('welcome.login')}</Text>
        </TouchableOpacity>
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
    height: height * 0.55,
    backgroundColor: Colors.primary,
    borderBottomLeftRadius: 50,
    borderBottomRightRadius: 50,
    elevation: 15,
    shadowColor: Colors.primaryDark,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 15,
    overflow: 'hidden', // to ensure background image stays inside rounded corners
  },
  topHalfImage: {
    opacity: 0.15,
    resizeMode: 'cover',
  },
  safeArea: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 30,
    paddingTop: 40,
  },
  tagline: {
    color: '#FFFFFF',
    fontSize: 28,
    fontWeight: '800',
    marginBottom: 40,
    textAlign: 'center',
    lineHeight: 40,
    textShadowColor: 'rgba(0,0,0,0.3)',
    textShadowOffset: { width: 0, height: 4 },
    textShadowRadius: 6,
  },
  iconContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  icon: {
    textShadowColor: 'rgba(0,0,0,0.3)',
    textShadowOffset: { width: 0, height: 8 },
    textShadowRadius: 15,
  },
  bottomHalf: {
    flex: 1,
    backgroundColor: 'transparent',
    justifyContent: 'center',
    paddingHorizontal: 30,
    borderBottomLeftRadius: 50, // To match the bottom overlay
    borderBottomRightRadius: 50, // To match the bottom overlay
  },
  bottomOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 100, // Safe area red block at bottom
    backgroundColor: Colors.primary,
    zIndex: -1,
  },
  registerButton: {
    backgroundColor: Colors.primary,
    paddingVertical: 18,
    borderRadius: 16,
    alignItems: 'center',
    marginBottom: 20,
    elevation: 8,
    shadowColor: Colors.primaryDark,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.4,
    shadowRadius: 8,
    borderBottomWidth: 5,
    borderColor: Colors.primaryDark, // 3D effect
  },
  registerButtonText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  loginButton: {
    backgroundColor: '#FFFFFF',
    paddingVertical: 18,
    borderRadius: 16,
    alignItems: 'center',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    borderWidth: 2,
    borderColor: '#EEEEEE',
    borderBottomWidth: 5, // 3D effect
    borderBottomColor: '#DDDDDD',
  },
  loginButtonText: {
    color: Colors.primary,
    fontSize: 18,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
});
