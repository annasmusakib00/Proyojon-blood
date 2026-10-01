import React, { useRef, useState } from 'react';
import { Animated, PanResponder, ScrollView, FlatList, StyleSheet, View, Easing, Text, ImageBackground } from 'react-native';
import { Colors } from '../constants/colors';
import { Ionicons } from '@expo/vector-icons';

const REFRESH_THRESHOLD = 80;

interface Props {
  refreshing: boolean;
  onRefresh: () => void;
  children?: React.ReactNode;
  outerStyle?: any;
  innerStyle?: any;
  imageBackgroundSource?: any;
  imageBackgroundStyle?: any;
  style?: any;
  contentContainerStyle?: any;
  showsVerticalScrollIndicator?: boolean;
  isFlatList?: boolean;
  flatListData?: any[];
  flatListRenderItem?: any;
  flatListKeyExtractor?: any;
  onEndReached?: any;
  onEndReachedThreshold?: number;
  ListFooterComponent?: any;
  ListHeaderComponent?: any;
  ListEmptyComponent?: any;
}

export function CustomRefreshScrollView({
  refreshing,
  onRefresh,
  children,
  outerStyle,
  innerStyle,
  imageBackgroundSource,
  imageBackgroundStyle,
  style,
  contentContainerStyle,
  showsVerticalScrollIndicator = false,
  isFlatList = false,
  flatListData,
  flatListRenderItem,
  flatListKeyExtractor,
  onEndReached,
  onEndReachedThreshold,
  ListFooterComponent,
  ListHeaderComponent,
  ListEmptyComponent,
}: Props) {
  const scrollY = useRef(0);
  const pullY = useRef(new Animated.Value(0)).current;
  const spinValue = useRef(new Animated.Value(0)).current;
  const [isPulling, setIsPulling] = useState(false);

  const startSpinning = () => {
    spinValue.setValue(0);
    Animated.loop(
      Animated.timing(spinValue, {
        toValue: 1,
        duration: 1000,
        easing: Easing.linear,
        useNativeDriver: true,
      })
    ).start();
  };

  const stopSpinning = () => {
    spinValue.stopAnimation();
  };

  React.useEffect(() => {
    if (refreshing) {
      Animated.spring(pullY, {
        toValue: REFRESH_THRESHOLD,
        useNativeDriver: true,
      }).start();
      startSpinning();
    } else {
      Animated.spring(pullY, {
        toValue: 0,
        useNativeDriver: true,
      }).start();
      stopSpinning();
    }
  }, [refreshing]);

  const panResponder = useRef(
    PanResponder.create({
      onMoveShouldSetPanResponderCapture: (evt, gestureState) => {
        // Capture the gesture if we are near the top and pulling down
        return scrollY.current <= 5 && gestureState.dy > 5 && Math.abs(gestureState.dy) > Math.abs(gestureState.dx);
      },
      onPanResponderGrant: () => {
        setIsPulling(true);
      },
      onPanResponderMove: (evt, gestureState) => {
        if (gestureState.dy > 0 && !refreshing) {
          // Dampen the pull slightly less so it's easier to reach
          const pullDistance = Math.min(gestureState.dy * 0.6, REFRESH_THRESHOLD * 1.5);
          pullY.setValue(pullDistance);
        }
      },
      onPanResponderRelease: (evt, gestureState) => {
        setIsPulling(false);
        const pullDistance = gestureState.dy * 0.6;
        if (pullDistance >= REFRESH_THRESHOLD * 0.7 && !refreshing) {
          onRefresh();
        } else if (!refreshing) {
          Animated.spring(pullY, {
            toValue: 0,
            useNativeDriver: true,
          }).start();
        }
      },
    })
  ).current;

  const spin = spinValue.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  return (
    <View style={[styles.container, outerStyle]}>
      <View style={styles.refreshIndicatorContainer} pointerEvents="none">
        <Animated.View
          style={[
            styles.refreshIconWrapper,
            {
              transform: [
                {
                  scale: pullY.interpolate({
                    inputRange: [0, REFRESH_THRESHOLD],
                    outputRange: [0.5, 1],
                    extrapolate: 'clamp',
                  }),
                },
                { 
                  rotate: refreshing ? spin : pullY.interpolate({
                    inputRange: [0, REFRESH_THRESHOLD],
                    outputRange: ['0deg', '360deg'],
                    extrapolate: 'clamp',
                  }) 
                },
              ],
            },
          ]}
        >
          {/* Custom Theme Icon */}
          <Ionicons name="water" size={24} color={Colors.primary} />
        </Animated.View>
      </View>

      <Animated.View
        style={{ flex: 1, transform: [{ translateY: pullY }] }}
        {...panResponder.panHandlers}
      >
        <View style={[{ flex: 1, backgroundColor: Colors.background }, innerStyle]}>
        {imageBackgroundSource ? (
          <ImageBackground
            source={imageBackgroundSource}
            style={{ flex: 1 }}
            imageStyle={imageBackgroundStyle}
          >
            {isFlatList ? (
              <FlatList
                data={flatListData}
                renderItem={flatListRenderItem}
                keyExtractor={flatListKeyExtractor}
                style={style || { flex: 1 }}
                contentContainerStyle={contentContainerStyle}
                showsVerticalScrollIndicator={showsVerticalScrollIndicator}
                onScroll={(e) => {
                  scrollY.current = e.nativeEvent.contentOffset.y;
                }}
                scrollEventThrottle={16}
                bounces={false}
                onEndReached={onEndReached}
                onEndReachedThreshold={onEndReachedThreshold}
                ListFooterComponent={ListFooterComponent}
                ListHeaderComponent={ListHeaderComponent}
                ListEmptyComponent={ListEmptyComponent}
              />
            ) : (
              <ScrollView
                style={style || { flex: 1 }}
                contentContainerStyle={contentContainerStyle}
                showsVerticalScrollIndicator={showsVerticalScrollIndicator}
                onScroll={(e) => {
                  scrollY.current = e.nativeEvent.contentOffset.y;
                }}
                scrollEventThrottle={16}
                bounces={false}
              >
                {children}
              </ScrollView>
            )}
          </ImageBackground>
        ) : (
          isFlatList ? (
            <FlatList
              data={flatListData}
              renderItem={flatListRenderItem}
              keyExtractor={flatListKeyExtractor}
              style={style || { flex: 1 }}
              contentContainerStyle={contentContainerStyle}
              showsVerticalScrollIndicator={showsVerticalScrollIndicator}
              onScroll={(e) => {
                scrollY.current = e.nativeEvent.contentOffset.y;
              }}
              scrollEventThrottle={16}
              bounces={false}
              onEndReached={onEndReached}
              onEndReachedThreshold={onEndReachedThreshold}
              ListFooterComponent={ListFooterComponent}
              ListHeaderComponent={ListHeaderComponent}
              ListEmptyComponent={ListEmptyComponent}
            />
          ) : (
            <ScrollView
              style={style || { flex: 1 }}
              contentContainerStyle={contentContainerStyle}
              showsVerticalScrollIndicator={showsVerticalScrollIndicator}
              onScroll={(e) => {
                scrollY.current = e.nativeEvent.contentOffset.y;
              }}
              scrollEventThrottle={16}
              bounces={false}
            >
              {children}
            </ScrollView>
          )
        )}
        </View>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
    overflow: 'visible',
  },
  refreshIndicatorContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: REFRESH_THRESHOLD,
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'visible',
  },
  refreshIconWrapper: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 5,
  },
});
