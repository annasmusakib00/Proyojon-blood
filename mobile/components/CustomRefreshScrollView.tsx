import React, { useRef, useState } from 'react';
import { ScrollView, FlatList, StyleSheet, View, Text, ImageBackground, RefreshControl } from 'react-native';
import { Colors } from '../constants/colors';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

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
  const insets = useSafeAreaInsets();
  const refreshControl = (
    <RefreshControl
      refreshing={refreshing}
      onRefresh={onRefresh}
      colors={[Colors.primary]}
      tintColor={Colors.primary}
    />
  );

  return (
    <View style={[styles.container, outerStyle]}>
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
                refreshControl={refreshControl}
                bounces={true}
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
                refreshControl={refreshControl}
                bounces={true}
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
              refreshControl={refreshControl}
              bounces={true}
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
              refreshControl={refreshControl}
              bounces={true}
            >
              {children}
            </ScrollView>
          )
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'transparent',
    overflow: 'visible',
  },
  refreshIndicatorContainer: {
    position: 'absolute',
    top: 26, // Counter-acts the marginTop: -26 of outerStyle so it starts exactly below the header
    left: 0,
    right: 0,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
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
  },
});
