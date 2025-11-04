import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
} from 'react-native';
import { useOrderHistory } from '@fastfoodordering/hooks';
import { Order } from '@fastfoodordering/types';
import Ionicons from '@expo/vector-icons/Ionicons';

export default function OrderHistoryTab() {
  // 1. Get logic from the hook
  const { orders } = useOrderHistory();

  // 2. Define how to render a single order card
  const renderOrderCard = ({ item }: { item: Order }) => (
    <View style={styles.card}>
      <View style={styles.cardHeader}>
        <View>
          <Text style={styles.orderId}>Order #{item.id}</Text>
          <Text style={styles.orderDate}>{item.date}</Text>
          <Text style={styles.droneName}>Drone: {item.droneName}</Text>
        </View>
        <Text style={styles.total}>${item.total.toFixed(2)}</Text>
      </View>
      <View style={styles.cardActions}>
        <TouchableOpacity style={styles.actionButton}>
          <Ionicons name="repeat" size={16} color="#007AFF" />
          <Text style={styles.actionText}>Reorder</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.actionButton}>
          <Ionicons name="star" size={16} color="#007AFF" />
          <Text style={styles.actionText}>Rate Order</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.actionButton}>
          <Ionicons name="eye" size={16} color="#007AFF" />
          <Text style={styles.actionText}>View Details</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  // 3. Render the UI
  return (
    <FlatList
      data={orders}
      keyExtractor={(item) => item.id}
      renderItem={renderOrderCard}
      style={styles.container}
      contentContainerStyle={styles.listContent}
    />
  );
}

// 4. Add the styles
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f4f4f4',
  },
  listContent: {
    padding: 16,
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 16,
    marginBottom: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  orderId: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  orderDate: {
    color: '#666',
    marginVertical: 4,
  },
  droneName: {
    color: '#666',
    fontSize: 12,
  },
  total: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#34C759', // Green
  },
  cardActions: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    borderTopWidth: 1,
    borderTopColor: '#eee',
    marginTop: 16,
    paddingTop: 16,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  actionText: {
    marginLeft: 6,
    color: '#007AFF', // Blue
    fontWeight: '500',
  },
});