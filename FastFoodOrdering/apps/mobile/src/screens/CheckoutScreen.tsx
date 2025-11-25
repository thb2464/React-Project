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
  const { cart, placeOrder, clearCart } = useAppState();
  
  const [loading, setLoading] = useState(false);
  const [address, setAddress] = useState('Ký túc xá khu A, ĐHQG');
  const [note, setNote] = useState('');

  const total = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);

  const formatPrice = (n: number) => new Intl.NumberFormat('vi-VN').format(n) + 'đ';

  const handleConfirmOrder = async () => {
    if (cart.length === 0) {
      Alert.alert('Giỏ hàng trống', 'Vui lòng thêm món ăn trước');
      return;
    }
    if (!address.trim()) {
      Alert.alert('Thiếu thông tin', 'Vui lòng nhập địa chỉ giao hàng');
      return;
    }

    setLoading(true);
    try {
      await placeOrder(address, note);
      
      Alert.alert(
        'Đặt hàng thành công!',
        'Đơn hàng đã được gửi đến nhà hàng. Drone đang chuẩn bị bay!',
        [{ text: 'Theo dõi đơn', onPress: () => navigation.navigate('OrdersTab') }]
      );
    } catch (error: any) {
      Alert.alert('Đặt hàng thất bại', error.message || 'Lỗi mạng');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
            <Ionicons name="arrow-back" size={24} color="#000" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Thanh Toán</Text>
        <View style={{width: 24}} /> 
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Delivery Address */}
        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Địa chỉ giao hàng</Text>
          <View style={styles.rowInput}>
            <Ionicons name="location-outline" size={24} color="#333" />
            <View style={styles.textContainer}>
              <Text style={styles.label}>Nhập địa chỉ</Text>
              <TextInput
                style={styles.input}
                value={address}
                onChangeText={setAddress}
                placeholder="Ví dụ: 123 Lê Lợi..."
                multiline
              />
            </View>
          </View>
          
          <View style={[styles.rowInput, {marginTop: 10}]}>
            <Ionicons name="create-outline" size={24} color="#333" />
            <View style={styles.textContainer}>
              <Text style={styles.label}>Ghi chú (Tùy chọn)</Text>
              <TextInput
                style={styles.input}
                value={note}
                onChangeText={setNote}
                placeholder="Ví dụ: Không cay, nhiều tương..."
              />
            </View>
          </View>
        </View>

        {/* Order Items */}
        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Tóm tắt đơn hàng</Text>
          {cart.length === 0 ? (
            <Text style={{color: '#888', fontStyle: 'italic'}}>Chưa có món nào</Text>
          ) : (
            cart.map((item) => (
              <View key={item.item_id} style={styles.summaryRow}>
                <Text style={styles.itemName}>
                  {item.quantity}x {item.name}
                </Text>
                <Text style={styles.itemPrice}>
                  {formatPrice(item.price * item.quantity)}
                </Text>
              </View>
            ))
          )}
          
          <View style={styles.divider} />
          
          <View style={[styles.summaryRow, styles.totalRow]}>
            <Text style={styles.totalLabel}>Tổng cộng</Text>
            <Text style={styles.totalText}>{formatPrice(total)}</Text>
          </View>
        </View>
      </ScrollView>

      {/* Bottom Button */}
      <View style={styles.footer}>
          <TouchableOpacity
            style={[styles.confirmButton, cart.length === 0 && styles.disabledBtn]}
            onPress={handleConfirmOrder}
            disabled={loading || cart.length === 0}
          >
            {loading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.confirmButtonText}>Xác Nhận Đặt Hàng • {formatPrice(total)}</Text>
            )}
          </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f4f4f4', paddingTop: 40 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 16, paddingBottom: 10 },
  backBtn: { padding: 4 },
  headerTitle: { fontSize: 20, fontWeight: 'bold' },
  scrollContent: { padding: 16 },
  card: { backgroundColor: '#fff', borderRadius: 12, padding: 16, marginBottom: 16 },
  sectionTitle: { fontSize: 16, fontWeight: 'bold', marginBottom: 12, color: '#333' },
  rowInput: { flexDirection: 'row', alignItems: 'center' },
  textContainer: { marginLeft: 12, flex: 1 },
  label: { fontSize: 12, color: '#888', marginBottom: 2 },
  input: { fontSize: 16, fontWeight: '500', borderBottomWidth: 1, borderBottomColor: '#eee', paddingVertical: 4, color: '#000' },
  summaryRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 10 },
  itemName: { fontSize: 15, color: '#444', flex: 1 },
  itemPrice: { fontSize: 15, fontWeight: '600' },
  divider: { height: 1, backgroundColor: '#eee', marginVertical: 10 },
  totalRow: { marginTop: 4 },
  totalLabel: { fontSize: 18, fontWeight: 'bold' },
  totalText: { fontSize: 18, fontWeight: 'bold', color: '#34C759' },
  footer: { padding: 16, backgroundColor: '#fff', borderTopWidth: 1, borderTopColor: '#eee' },
  confirmButton: { backgroundColor: '#000', padding: 18, borderRadius: 12, alignItems: 'center' },
  disabledBtn: { backgroundColor: '#ccc' },
  confirmButtonText: { color: '#fff', fontSize: 18, fontWeight: 'bold' },
});