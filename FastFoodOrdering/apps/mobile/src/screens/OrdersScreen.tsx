import React, { useState } from 'react';
import { View, useWindowDimensions, StyleSheet, Text } from 'react-native';
import { TabView, SceneMap, TabBar } from 'react-native-tab-view';

// Import our new tab components
import CurrentOrderTab from './orders/CurrentOrderTab';
import OrderHistoryTab from './orders/OrderHistoryTab';
import DroneTrackingTab from './orders/DroneTrackingTab';

// 1. Define the scenes for the tab navigator
const renderScene = SceneMap({
  current: CurrentOrderTab,
  history: OrderHistoryTab,
  tracking: DroneTrackingTab,
});

// 2. This is the main component
export default function OrdersScreen() {
  const layout = useWindowDimensions();

  const [index, setIndex] = useState(0);
  const [routes] = useState([
    { key: 'current', title: 'Current Order' },
    { key: 'history', title: 'Order History' },
    { key: 'tracking', title: 'Drone Tracking' },
  ]);

  // 3. Render the Tab View
  return (
    <TabView
      navigationState={{ index, routes }}
      renderScene={renderScene}
      onIndexChange={setIndex}
      initialLayout={{ width: layout.width }}
      renderTabBar={(props) => (
        <TabBar
          {...(props as any)}
          style={styles.tabBar}
          indicatorStyle={styles.indicator}
          labelStyle={styles.label}
          activeColor="#000"
          inactiveColor="#555"
        />
      )}
    />
  );
}

// 4. Add the styles
const styles = StyleSheet.create({
  tabBar: {
    backgroundColor: '#FFFFFF',
    paddingTop: 30,
    height: 80,
  },
  
  indicator: {
    backgroundColor: '#000000',
  },
  label: {
    fontWeight: 'bold',
    fontSize: 5,
  },
});