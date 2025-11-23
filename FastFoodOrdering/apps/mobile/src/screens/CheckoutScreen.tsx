import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  ActivityIndicator,
  Alert,
} from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';
import { useNavigation } from '@react-navigation/native';
import { useAppState } from '@fastfoodordering/store';

export default function CheckoutScreen() {
  const navigation = useNavigation<any>();
  
  const { cart, placeOrder } = useAppState();
  
  const [loading, setLoading] = useState(false);
  const [address, setAddress] = useState('123 Main St, Toronto, ON');

  // Calculate total based on 'price' (not discountedPrice)
  const total = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);

  const handleConfirmOrder = async () => {
  if (cart.length === 0) {
    Alert.alert('Giỏ hàng trống', 'Vui lòng thêm món ăn trước');
    return;
  }

  setLoading(true);
  try {
    // GỌI HÀM placeOrder MỚI – TRUYỀN ĐỊA CHỈ + GHI CHÚ
    await placeOrder(address,);

    Alert.alert(
      'Đặt hàng thành công!',
      'Đơn hàng đã được gửi đến nhà hàng. Drone đang chuẩn bị bay!',
      [{ text: 'Theo dõi đơn', onPress: () => navigation.navigate('Orders') }]
    );
  } catch (error: any) {
    Alert.alert('Đặt hàng thất bại', error.message || 'Lỗi mạng');
  } finally {
    setLoading(false);
  }
};

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.header}>Checkout</Text>

      <View style={styles.card}>
        <Text style={styles.sectionTitle}>Delivery Details</Text>
        <View style={styles.row}>
          <Ionicons name="location-outline" size={24} color="#333" />
          <View style={styles.textContainer}>
            <Text style={styles.label}>Address</Text>
            <TextInput
              style={styles.input}
              value={address}
              onChangeText={setAddress}
              multiline
            />
          </View>
        </View>
      </View>

      <View style={styles.card}>
        <Text style={styles.sectionTitle}>Order Summary</Text>
        {cart.map((item) => (
          <View key={item.item_id} style={styles.summaryRow}>
            <Text style={styles.textSecondary}>
              {item.quantity}x {item.name}
            </Text>
            <Text style={styles.textSecondary}>
              ${(item.price * item.quantity).toFixed(2)}
            </Text>
          </View>
        ))}
        <View style={styles.divider} />
        <View style={[styles.summaryRow, styles.totalRow]}>
          <Text style={styles.totalText}>Total</Text>
          <Text style={styles.totalText}>${total.toFixed(2)}</Text>
        </View>
      </View>

      <TouchableOpacity
        style={styles.confirmButton}
        onPress={handleConfirmOrder}
        disabled={loading}
      >
        {loading ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text style={styles.confirmButtonText}>Confirm Order</Text>
        )}
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f4f4f4', padding: 16 },
  header: { fontSize: 24, fontWeight: 'bold', marginBottom: 20 },
  card: { backgroundColor: '#fff', borderRadius: 8, padding: 16, marginBottom: 16 },
  sectionTitle: { fontSize: 18, fontWeight: 'bold', marginBottom: 12 },
  row: { flexDirection: 'row', alignItems: 'center', marginBottom: 12 },
  textContainer: { marginLeft: 16, flex: 1 },
  textSecondary: { fontSize: 14, color: '#666' },
  label: { fontSize: 12, color: '#888', marginBottom: 4 },
  input: { fontSize: 16, fontWeight: '500', borderBottomWidth: 1, borderBottomColor: '#eee', paddingVertical: 4 },
  summaryRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 },
  divider: { height: 1, backgroundColor: '#eee', marginVertical: 8 },
  totalRow: { marginTop: 4 },
  totalText: { fontSize: 18, fontWeight: 'bold' },
  confirmButton: { backgroundColor: '#34C759', padding: 16, borderRadius: 8, alignItems: 'center', marginBottom: 40 },
  confirmButtonText: { color: '#fff', fontSize: 18, fontWeight: 'bold' },
});