import React, { useRef, useState } from 'react';
import { Animated, PanResponder, ScrollView, FlatList, StyleSheet, View, Easing, Text } from 'react-native';
import { Colors } from '../constants/colors';
import { Ionicons } from '@expo/vector-icons';

const REFRESH_THRESHOLD = 80;

interface Props {
  refreshing: boolean;
  onRefresh: () => void;
  children?: React.ReactNode;
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
      onMoveShouldSetPanResponder: (evt, gestureState) => {
        // Only trigger pull-to-refresh if we are at the top and pulling down
        return scrollY.current <= 0 && gestureState.dy > 10;
      },
      onPanResponderGrant: () => {
        setIsPulling(true);
      },
      onPanResponderMove: (evt, gestureState) => {
        if (gestureState.dy > 0 && !refreshing) {
          // Dampen the pull
          const pullDistance = Math.min(gestureState.dy * 0.5, REFRESH_THRESHOLD * 1.5);
          pullY.setValue(pullDistance);
        }
      },
      onPanResponderRelease: (evt, gestureState) => {
        setIsPulling(false);
        if (gestureState.dy * 0.5 >= REFRESH_THRESHOLD && !refreshing) {
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
    <View style={[styles.container, style]}>
      {/* Background refresh icon container */}
      <View style={styles.refreshIndicatorContainer}>
        <Animated.View
          style={[
            styles.refreshIconWrapper,
            {
              transform: [
                {
                  scale: pullY.interpolate({
                    inputRange: [0, REFRESH_THRESHOLD],
                    outputRange: [0, 1],
                    extrapolate: 'clamp',
                  }),
                },
                { rotate: spin },
              ],
            },
          ]}
        >
          {/* Custom Theme Icon */}
          <Ionicons name="water" size={32} color={Colors.primary} />
        </Animated.View>
      </View>

      <Animated.View
        style={{ flex: 1, transform: [{ translateY: pullY }] }}
        {...panResponder.panHandlers}
      >
        {isFlatList ? (
          <FlatList
            data={flatListData}
            renderItem={flatListRenderItem}
            keyExtractor={flatListKeyExtractor}
            style={{ flex: 1 }}
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
            style={{ flex: 1 }}
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
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'transparent',
  },
  refreshIndicatorContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: REFRESH_THRESHOLD,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: -1, // Keep behind the white content
  },
  refreshIconWrapper: {
    width: 48,
    height: 48,
    borderRadius: 24,
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
