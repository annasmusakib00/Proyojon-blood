import React, { useRef, useState } from 'react';
import { View, Text, StyleSheet, Dimensions, FlatList, Image, TouchableOpacity, SafeAreaView, NativeScrollEvent, NativeSyntheticEvent } from 'react-native';
import { useRouter } from 'expo-router';
import { Colors } from '../../constants/colors';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { t } from '../../utils/i18n';
import { useLocaleStore } from '../../stores/localeStore';

const { width, height } = Dimensions.get('window');

const slides = [
  {
    id: '1',
    titleKey: 'onboarding.radarTitle',
    descKey: 'onboarding.radarDesc',
    image: require('../../assets/images/onboarding_radar.png'),
  },
  {
    id: '2',
    titleKey: 'onboarding.searchTitle',
    descKey: 'onboarding.searchDesc',
    image: require('../../assets/images/onboarding_search.png'),
  }
];

export default function OnboardingScreen() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const flatListRef = useRef<FlatList>(null);
  const router = useRouter();
  const { locale } = useLocaleStore();

  const handleScroll = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
    const slideSize = event.nativeEvent.layoutMeasurement.width;
    const index = event.nativeEvent.contentOffset.x / slideSize;
    const roundIndex = Math.round(index);
    if (roundIndex !== currentIndex && roundIndex >= 0 && roundIndex < slides.length) {
      setCurrentIndex(roundIndex);
    }
  };

  const handleNext = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    if (currentIndex < slides.length - 1) {
      flatListRef.current?.scrollToIndex({ index: currentIndex + 1, animated: true });
    } else {
      router.replace('/(auth)/welcome');
    }
  };

  const renderItem = ({ item }: { item: typeof slides[0] }) => {
    return (
      <View style={styles.slide}>
        <Image source={item.image} style={styles.image} resizeMode="contain" />
        <View style={styles.textContainer}>
          <Text style={styles.title}>{t(item.titleKey)}</Text>
          <Text style={styles.description}>{t(item.descKey)}</Text>
        </View>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <FlatList
        ref={flatListRef}
        data={slides}
        renderItem={renderItem}
        horizontal
        showsHorizontalScrollIndicator={false}
        pagingEnabled
        bounces={false}
        keyExtractor={(item) => item.id}
        onScroll={handleScroll}
        scrollEventThrottle={16}
      />

      <View style={styles.footer}>
        <View style={styles.paginationContainer}>
          {slides.map((_, index) => (
            <View
              key={index}
              style={[
                styles.dot,
                currentIndex === index ? styles.activeDot : styles.inactiveDot,
              ]}
            />
          ))}
        </View>

        <TouchableOpacity 
          style={[styles.nextButton, currentIndex === slides.length - 1 && styles.getStartedButton]} 
          onPress={handleNext}
          activeOpacity={0.8}
        >
          {currentIndex === slides.length - 1 ? (
            <Text style={styles.getStartedText}>{t('onboarding.start')}</Text>
          ) : (
            <Ionicons name="arrow-forward" size={24} color="#FFFFFF" />
          )}
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  slide: {
    width,
    alignItems: 'center',
    paddingTop: height * 0.1,
  },
  image: {
    width: width * 0.8,
    height: width * 0.8,
    marginBottom: 40,
  },
  textContainer: {
    paddingHorizontal: 40,
    alignItems: 'center',
  },
  title: {
    fontSize: 28,
    fontWeight: '800',
    color: '#1A1A1A', // Dark charcoal/black
    textAlign: 'center',
    marginBottom: 16,
  },
  description: {
    fontSize: 16,
    fontWeight: '500',
    color: '#4B5563', // Dark charcoal grey
    textAlign: 'center',
    lineHeight: 24,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 40,
    paddingBottom: 40,
  },
  paginationContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  dot: {
    height: 8,
    borderRadius: 4,
    marginRight: 8,
  },
  activeDot: {
    width: 24,
    backgroundColor: Colors.primary, // #8A0303 Real Blood
  },
  inactiveDot: {
    width: 8,
    backgroundColor: '#D3D3D3', // Light grey
  },
  nextButton: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: Colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 4,
    shadowColor: Colors.primaryDark,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
  },
  getStartedButton: {
    width: 'auto',
    paddingHorizontal: 24,
    height: 56,
    borderRadius: 28,
  },
  getStartedText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
});
