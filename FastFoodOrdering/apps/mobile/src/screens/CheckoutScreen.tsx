import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';
import { useNavigation } from '@react-navigation/native';
import { HomeScreenNavigationProp } from '../navigation/types';
export default function CheckoutScreen() {
  const navigation = useNavigation<HomeScreenNavigationProp>();

  // Mock data for the demo
  const subtotal = 22.98;
  const deliveryFee = 2.99;
  const total = subtotal + deliveryFee;

  const handleConfirmOrder = () => {
    alert('Order Confirmed!');
    navigation.navigate('Home');
  };

  return (
    <ScrollView style={styles.container}>
      {/* 1. Delivery Details */}
      <View style={styles.card}>
        <Text style={styles.sectionTitle}>Delivery Details</Text>
        <View style={styles.row}>
          <Ionicons name="location-outline" size={24} color="#333" />
          <View style={styles.textContainer}>
            <Text style={styles.textPrimary}>123 Main St, Apt 4B</Text>
            <Text style={styles.textSecondary}>Toronto, ON</Text>
          </View>
        </View>
        <View style={styles.row}>
          <Ionicons name="person-outline" size={24} color="#333" />
          <View style={styles.textContainer}>
            <Text style={styles.textPrimary}>John Doe</Text>
            <Text style={styles.textSecondary}>(123) 456-7890</Text>
          </View>
        </View>
      </View>

      {/* 2. Payment Method */}
      <View style={styles.card}>
        <Text style={styles.sectionTitle}>Payment Method</Text>
        <View style={styles.row}>
          <Ionicons name="card-outline" size={24} color="#333" />
          <View style={styles.textContainer}>
            <Text style={styles.textPrimary}>Mastercard</Text>
            <Text style={styles.textSecondary}>**** **** **** 1234</Text>
          </View>
        </View>
      </View>

      {/* 3. Order Summary */}
      <View style={styles.card}>
        <Text style={styles.sectionTitle}>Order Summary</Text>
        <View style={styles.summaryRow}>
          <Text style={styles.textSecondary}>Subtotal</Text>
          <Text style={styles.textSecondary}>${subtotal.toFixed(2)}</Text>
        </View>
        <View style={styles.summaryRow}>
          <Text style={styles.textSecondary}>Delivery Fee</Text>
          <Text style={styles.textSecondary}>${deliveryFee.toFixed(2)}</Text>
        </View>
        <View style={[styles.summaryRow, styles.totalRow]}>
          <Text style={styles.totalText}>Total</Text>
          <Text style={styles.totalText}>${total.toFixed(2)}</Text>
        </View>
      </View>

      {/* 4. Confirm Button */}
      <TouchableOpacity
        style={styles.confirmButton}
        onPress={handleConfirmOrder}
      >
        <Text style={styles.confirmButtonText}>Confirm Order</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

// 5. Add the Styles
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
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 12,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  textContainer: {
    marginLeft: 16,
  },
  textPrimary: {
    fontSize: 16,
    fontWeight: '500',
  },
  textSecondary: {
    fontSize: 14,
    color: '#666',
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  totalRow: {
    borderTopWidth: 1,
    borderTopColor: '#eee',
    marginTop: 8,
    paddingTop: 8,
  },
  totalText: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  confirmButton: {
    backgroundColor: '#34C759', // Green
    padding: 16,
    borderRadius: 8,
    margin: 16,
    alignItems: 'center',
  },
  confirmButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
});