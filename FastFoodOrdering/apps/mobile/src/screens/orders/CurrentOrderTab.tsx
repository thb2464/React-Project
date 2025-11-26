import React, { useRef, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator } from 'react-native';
import MapView, { Marker, Polyline } from 'react-native-maps';
import { useCurrentOrder } from '@fastfoodordering/hooks';
import Ionicons from '@expo/vector-icons/Ionicons';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';

const formatPrice = (n: number) => new Intl.NumberFormat('vi-VN').format(n) + 'đ';

export default function CurrentOrderTab() {
  const {
    currentOrder,
    dronePosition,
    restaurantCoords,
    customerCoords,
    startSimulation,
    isSimulating,
    hasArrived,
    finishOrder
  } = useCurrentOrder();

  const mapRef = useRef<MapView>(null);

  useEffect(() => {
    if (currentOrder && mapRef.current) {
      mapRef.current.fitToCoordinates([restaurantCoords, customerCoords], {
        edgePadding: { top: 50, right: 50, bottom: 50, left: 50 },
        animated: true,
      });
    }
  }, [currentOrder, restaurantCoords, customerCoords]);

  if (!currentOrder) {
    return (
      <View style={styles.center}>
        <Ionicons name="receipt-outline" size={64} color="#ccc" />
        <Text style={styles.emptyText}>Chưa có đơn hàng</Text>
        <Text style={styles.subText}>Hãy đặt món ăn đầu tiên của bạn!</Text>
      </View>
    );
  }

  const getStatusText = (s: string) => {
    switch(s) {
      case 'pending': return 'Chờ xác nhận';
      case 'confirmed': return 'Đã xác nhận';
      case 'preparing': return 'Đang chuẩn bị';
      case 'out_for_delivery': return 'Đang giao hàng';
      case 'delivered': return 'Đã giao hàng';
      case 'cancelled': return 'Đã hủy';
      default: return s;
    }
  };

  return (
    <ScrollView style={styles.container}>
      {/* 1. Status Card */}
      <View style={styles.card}>
        <View style={styles.headerRow}>
          <Text style={styles.orderTitle}>Đơn hàng #{currentOrder.order_id}</Text>
          <View style={[styles.statusBadge, { 
              backgroundColor: currentOrder.status === 'delivered' ? '#e8f5e9' : '#e1f5fe' 
          }]}>
            <Text style={[styles.statusText, {
              color: currentOrder.status === 'delivered' ? '#2e7d32' : '#0288d1'
            }]}>
                {getStatusText(currentOrder.status).toUpperCase()}
            </Text>
          </View>
        </View>
        <Text style={styles.restName}>{currentOrder.restaurant_name}</Text>
        
        {currentOrder.drone_name ? (
           <View style={styles.droneInfo}>
             <MaterialCommunityIcons name="quadcopter" size={16} color="#007AFF" />
             <Text style={styles.droneText}> Drone: {currentOrder.drone_name}</Text>
           </View>
        ) : (
           <Text style={styles.waitText}>Đang điều phối drone...</Text>
        )}
      </View>

      {/* 2. Map Section */}
      <View style={[styles.card, styles.mapCard]}>
        <MapView
          ref={mapRef}
          style={styles.map}
          initialRegion={{
            ...restaurantCoords,
            latitudeDelta: 0.02,
            longitudeDelta: 0.02,
          }}
        >
          <Polyline coordinates={[restaurantCoords, customerCoords]} strokeColor="#007AFF" strokeWidth={3} lineDashPattern={[1]} />
          
          {/* Restaurant Marker: zIndex 1 (Bottom) */}
          <Marker 
            coordinate={restaurantCoords} 
            title={currentOrder.restaurant_name} 
            anchor={{ x: 0.5, y: 0.5 }}
            zIndex={1} 
          >
            <View style={styles.markerBase}><Ionicons name="restaurant" size={16} color="white" /></View>
          </Marker>
          
          {/* Customer Marker */}
          <Marker coordinate={customerCoords} title="Bạn" anchor={{ x: 0.5, y: 0.5 }} zIndex={1}>
            <View style={[styles.markerBase, {backgroundColor:'red'}]}><Ionicons name="person" size={16} color="white" /></View>
          </Marker>

          {/* Drone Marker: zIndex 10 (Top - No Flickering) */}
          <Marker 
            coordinate={dronePosition} 
            anchor={{ x: 0.5, y: 0.5 }}
            zIndex={10}
          >
             <View style={[styles.droneMarker, { 
                 backgroundColor: currentOrder.status === 'delivered' ? '#34C759' : '#007AFF' 
             }]}>
                <MaterialCommunityIcons name="quadcopter" size={24} color="white" />
             </View>
          </Marker>
        </MapView>

        {/* Simulation / Completion Button */}
        {currentOrder.status !== 'pending' && currentOrder.status !== 'delivered' && (
            <View style={styles.buttonContainer}>
                {hasArrived ? (
                    <TouchableOpacity 
                        style={[styles.simButton, { backgroundColor: '#34C759' }]} 
                        onPress={finishOrder}
                    >
                        <Ionicons name="checkmark-circle" size={20} color="#fff" />
                        <Text style={styles.simButtonText}>Xác nhận đã nhận hàng</Text>
                    </TouchableOpacity>
                ) : (
                    <TouchableOpacity 
                        style={[styles.simButton, isSimulating && styles.simButtonDisabled]} 
                        onPress={startSimulation}
                        disabled={isSimulating}
                    >
                        <MaterialCommunityIcons name={isSimulating ? "quadcopter" : "play"} size={20} color="#fff" />
                        <Text style={styles.simButtonText}>
                            {isSimulating ? 'Drone đang bay...' : 'Mô phỏng giao hàng'}
                        </Text>
                    </TouchableOpacity>
                )}
            </View>
        )}
      </View>

      {/* 3. Order Details */}
      <View style={styles.card}>
        <Text style={styles.sectionTitle}>Chi tiết món</Text>
        {currentOrder.items?.map((item: any, index: number) => (
          <View key={index} style={styles.itemRow}>
            <Text style={styles.qty}>{item.quantity}x</Text>
            <Text style={styles.name}>{item.name}</Text>
            <Text style={styles.price}>{formatPrice(item.price * item.quantity)}</Text>
          </View>
        ))}
        <View style={styles.totalRow}>
            <Text style={styles.totalLabel}>Tổng cộng</Text>
            <Text style={styles.totalValue}>{formatPrice(currentOrder.total)}</Text>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f4f4f4' },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#f4f4f4' },
  emptyText: { fontSize: 18, fontWeight: 'bold', marginTop: 16, color: '#333' },
  subText: { color: '#666', marginTop: 8 },
  card: { backgroundColor: '#fff', margin: 16, marginBottom: 0, borderRadius: 12, padding: 16, elevation: 2 },
  headerRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  orderTitle: { fontSize: 18, fontWeight: 'bold' },
  statusBadge: { paddingHorizontal: 8, paddingVertical: 4, borderRadius: 4 },
  statusText: { fontWeight: 'bold', fontSize: 12 },
  restName: { color: '#666', marginTop: 4, marginBottom: 8 },
  droneInfo: { flexDirection: 'row', alignItems: 'center', marginTop: 4 },
  droneText: { color: '#007AFF', fontWeight: '600', marginLeft: 6 },
  waitText: { color: '#999', fontStyle: 'italic', marginTop: 4 },
  mapCard: { padding: 0, overflow: 'hidden', height: 300 },
  map: { width: '100%', height: '100%' },
  markerBase: { 
    backgroundColor: 'green', 
    width: 36,  // Fixed width
    height: 36, // Fixed height
    borderRadius: 18,
    borderWidth: 2, 
    borderColor: 'white', 
    justifyContent: 'center', // Center icon vertically
    alignItems: 'center'      // Center icon horizontally
  },
  droneMarker: { 
    width: 44, // Fixed width (slightly larger than base)
    height: 44, // Fixed height
    borderRadius: 22, 
    borderWidth: 2, 
    borderColor: 'white', 
    elevation: 5,
    justifyContent: 'center',
    alignItems: 'center',
  },
  buttonContainer: { position: 'absolute', bottom: 16, alignSelf: 'center' },
  simButton: { backgroundColor: '#000', flexDirection: 'row', alignItems: 'center', paddingVertical: 10, paddingHorizontal: 20, borderRadius: 20, elevation: 5 },
  simButtonDisabled: { backgroundColor: '#666' },
  simButtonText: { color: '#fff', fontWeight: 'bold', marginLeft: 8 },
  sectionTitle: { fontSize: 16, fontWeight: 'bold', marginBottom: 12 },
  itemRow: { flexDirection: 'row', marginBottom: 8 },
  qty: { fontWeight: 'bold', width: 30 },
  name: { flex: 1 },
  price: { color: '#333' },
  totalRow: { flexDirection: 'row', justifyContent: 'space-between', borderTopWidth: 1, borderTopColor: '#eee', paddingTop: 12, marginTop: 4 },
  totalLabel: { fontSize: 16, fontWeight: 'bold' },
  totalValue: { fontSize: 16, fontWeight: 'bold', color: '#34C759' },
});