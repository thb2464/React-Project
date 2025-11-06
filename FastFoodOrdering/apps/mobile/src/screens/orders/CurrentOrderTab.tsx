import React, { useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import MapView, { Marker, Polyline } from 'react-native-maps';
import { useCurrentOrder } from '@fastfoodordering/hooks';
import Ionicons from '@expo/vector-icons/Ionicons';

export default function CurrentOrderTab() {
  // 1. Get all logic hooks
  const {
    currentOrder,
    dronePosition,
    routeCoords,
    RESTAURANT_COORDS,
    CUSTOMER_COORDS,
    startSimulation,
  } = useCurrentOrder();

  const mapRef = useRef<MapView>(null);

  // 2. Render the UI
  return (
    <ScrollView style={styles.container}>
      {/* Order Header */}
      <View style={styles.card}>
        <View style={styles.orderHeader}>
          <Text style={styles.orderTitle}>Order #{currentOrder.id}</Text>
          <Text style={styles.statusText}>{currentOrder.status}</Text>
        </View>
        <Text style={styles.dateText}>{currentOrder.date}</Text>
      </View>

      {/* Map Section */}
      <View style={[styles.card, styles.mapCard]}>
        <View style={styles.mapControls}>
          <TouchableOpacity style={styles.mapButton} onPress={startSimulation}>
            <Ionicons name="play" size={16} color="#000" />
            <Text style={styles.mapButtonText}>Simulate</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.mapButton}
            onPress={() => mapRef.current?.animateToRegion({ ...dronePosition, latitudeDelta: 0.01, longitudeDelta: 0.01 })}
          >
            <Ionicons name="locate" size={16} color="#000" />
            <Text style={styles.mapButtonText}>Center</Text>
          </TouchableOpacity>
        </View>
        <MapView
          ref={mapRef}
          style={styles.map}
          initialRegion={{
            latitude: 43.657,
            longitude: -79.39,
            latitudeDelta: 0.02,
            longitudeDelta: 0.02,
          }}
        >
          <Polyline
            coordinates={routeCoords}
            strokeColor="#0000FF"
            strokeWidth={3}
          />
          <Marker
            title="Restaurant"
            coordinate={RESTAURANT_COORDS}
            pinColor="green"
          />
          <Marker title="Customer" coordinate={CUSTOMER_COORDS} pinColor = 'red' />
          <Marker
            title="Drone"
            coordinate={dronePosition}
            anchor={{ x: 0.25, y: 0.25 }} // Center the icon
            >
            <Ionicons name="ellipse" size={24} color="orange" />
          </Marker>
        </MapView>
      </View>

      {/* Order Items */}
      <View style={styles.card}>
        <Text style={styles.sectionTitle}>Order Items</Text>
        {currentOrder.items.map((item, index) => (
          <View key={index} style={styles.itemRow}>
            <Text>1x {item.name}</Text>
            <Text>${item.price.toFixed(2)}</Text>
          </View>
        ))}
        <View style={styles.itemRow}>
          <Text>Delivery Fee</Text>
          <Text>$2.99</Text>
        </View>
        <View style={[styles.itemRow, styles.totalRow]}>
          <Text style={styles.totalText}>Total</Text>
          <Text style={styles.totalText}>
            ${(currentOrder.total + 2.99).toFixed(2)}
          </Text>
        </View>
      </View>
    </ScrollView>
  );
}

// 3. Add the Styles
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f4f4f4',
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 16,
    marginHorizontal: 16,
    marginTop: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  orderHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  orderTitle: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  statusText: {
    color: '#34C759', // Green
    fontWeight: 'bold',
  },
  dateText: {
    color: '#666',
    marginTop: 4,
  },
  mapCard: {
    padding: 0,
    overflow: 'hidden', // Keeps map inside rounded corners
  },
  mapControls: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingVertical: 10,
    backgroundColor: '#f9f9f9',
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  mapButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#eee',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 15,
  },
  mapButtonText: {
    marginLeft: 6,
    fontWeight: '500',
  },
  map: {
    width: '100%',
    height: 300,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  itemRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 6,
  },
  totalRow: {
    borderTopWidth: 1,
    borderTopColor: '#eee',
    marginTop: 10,
    paddingTop: 10,
  },
  totalText: {
    fontWeight: 'bold',
    fontSize: 16,
  },
});