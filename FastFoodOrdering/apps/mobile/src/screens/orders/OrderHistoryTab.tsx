import React, { useCallback } from 'react';
import { View, Text, StyleSheet, FlatList, ActivityIndicator, RefreshControl } from 'react-native';
import { useOrderHistory } from '@fastfoodordering/hooks';
import { useFocusEffect } from '@react-navigation/native';

const formatPrice = (n: number) => new Intl.NumberFormat('vi-VN').format(n) + 'đ';

export default function OrderHistoryTab() {
  const { orders, isLoading, refresh } = useOrderHistory();

  useFocusEffect(
    useCallback(() => {
      refresh();
    }, [refresh])
  );

  // --- TRANSLATION HELPER (Matches CurrentOrderTab) ---
  const getStatusText = (s: string) => {
    switch(s) {
      case 'pending': return 'Chờ xác nhận';
      case 'confirmed': return 'Đã xác nhận';
      case 'preparing': return 'Đang chuẩn bị';
      case 'out_for_delivery': return 'Đang giao hàng';
      case 'delivered': return 'Đã giao hàng';
      case 'cancelled': return 'Đã hủy';
      default: return s.replace(/_/g, ' '); // Fallback: remove underscores if no match
    }
  };

  const renderItem = ({ item }: { item: any }) => {
    const totalAmount = Number(item.total) || 0;
    
    const getStatusColor = (status: string) => {
      switch (status) {
        case 'pending': return 'orange';
        case 'confirmed': return '#007AFF';
        case 'out_for_delivery': return '#34C759';
        case 'delivered': return 'gray';
        default: return '#333';
      }
    };

    return (
      <View style={styles.card}>
        <View style={styles.row}>
          <Text style={styles.date}>{new Date(item.created_at).toLocaleDateString('vi-VN')}</Text>
          {/* FIX: Use getStatusText here */}
          <Text style={[styles.status, { color: getStatusColor(item.status) }]}>
            {getStatusText(item.status).toUpperCase()}
          </Text>
        </View>
        <Text style={styles.restaurant}>{item.restaurant_name}</Text>
        <View style={styles.divider} />
        <View style={styles.row}>
          <Text style={styles.itemsText}>{item.items?.length || 0} món</Text>
          <Text style={styles.total}>{formatPrice(totalAmount)}</Text>
        </View>
      </View>
    );
  };

  if (isLoading && orders.length === 0) return <View style={styles.center}><ActivityIndicator size="large" color="#000" /></View>;

  return (
    <View style={styles.container}>
      <FlatList
        data={orders}
        renderItem={renderItem}
        keyExtractor={(item) => item.order_id.toString()} 
        contentContainerStyle={styles.listContent}
        refreshControl={<RefreshControl refreshing={isLoading} onRefresh={refresh} />}
        ListEmptyComponent={<View style={styles.center}><Text>Chưa có lịch sử đơn hàng.</Text></View>}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f4f4f4' },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  listContent: { padding: 16 },
  card: { backgroundColor: '#fff', borderRadius: 12, padding: 16, marginBottom: 12, elevation: 2 },
  row: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  date: { color: '#888', fontSize: 12 },
  status: { fontWeight: 'bold', fontSize: 12 },
  restaurant: { fontSize: 16, fontWeight: 'bold', marginTop: 4, marginBottom: 8 },
  divider: { height: 1, backgroundColor: '#eee', marginVertical: 8 },
  itemsText: { color: '#666' },
  total: { fontSize: 16, fontWeight: 'bold' },
});