import React, { useState } from 'react';
import { View, StyleSheet, useWindowDimensions } from 'react-native';
import { TabView, SceneMap, TabBar } from 'react-native-tab-view';
import { SafeAreaView } from 'react-native-safe-area-context';
import CurrentOrderTab from './orders/CurrentOrderTab';
import OrderHistoryTab from './orders/OrderHistoryTab';

// REMOVED: DroneTrackingTab
const renderScene = SceneMap({
  current: CurrentOrderTab,
  history: OrderHistoryTab,
});

export default function OrdersScreen() {
  const layout = useWindowDimensions();
  const [index, setIndex] = useState(0);
  
  // REMOVED: The middle 'Drone' tab
  const [routes] = useState([
    { key: 'current', title: 'Đơn hiện tại' },
    { key: 'history', title: 'Lịch sử' },
  ]);

  const renderTabBar = (props: any) => (
    <TabBar
      {...props}
      indicatorStyle={{ backgroundColor: '#000' }}
      style={{ backgroundColor: '#fff', shadowOpacity: 0, elevation: 0 }}
      activeColor="#000"
      inactiveColor="#999"
      labelStyle={{ fontWeight: 'bold' }}
    />
  );

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <View style={styles.container}>
        <TabView
          navigationState={{ index, routes }}
          renderScene={renderScene}
          onIndexChange={setIndex}
          initialLayout={{ width: layout.width }}
          renderTabBar={renderTabBar}
        />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#fff' },
  container: { flex: 1, backgroundColor: '#f4f4f4', paddingTop: 10 },
});