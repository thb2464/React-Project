import React from 'react';
import { View, Text, StyleSheet, FlatList, TextInput, TouchableOpacity } from 'react-native';
import { useDrones } from '@fastfoodordering/hooks';
import Ionicons from '@expo/vector-icons/Ionicons';

function StatsDisplay({ counts }: { counts: any }) {
  return (
    <View style={styles.statsContainer}>
      <View style={styles.statItem}>
        <Text style={styles.statLabel}>Đang bay</Text>
        <Text style={[styles.statValue, { color: '#34C759' }]}>{counts.in_flight}</Text>
      </View>
      <View style={styles.statItem}>
        <Text style={styles.statLabel}>Chờ</Text>
        <Text style={[styles.statValue, { color: '#007AFF' }]}>{counts.idle}</Text>
      </View>
      <View style={styles.statItem}>
        <Text style={styles.statLabel}>Sạc pin</Text>
        <Text style={[styles.statValue, { color: '#FF9500' }]}>{counts.charging}</Text>
      </View>
      <View style={styles.statItem}>
        <Text style={styles.statLabel}>Tổng</Text>
        <Text style={styles.statValue}>{counts.total}</Text>
      </View>
    </View>
  );
}

function DroneCard({ item }: { item: any }) {
  const statusColor = item.status === 'in_flight' ? '#34C759' : 
                      item.status === 'idle' ? '#007AFF' : '#999';
  const icon = item.status === 'in_flight' ? 'airplane' : 'stop-circle';

  return (
    <View style={styles.card}>
      <View style={styles.cardHeader}>
        <View style={styles.cardInfo}>
          <Text style={styles.droneName}>{item.name}</Text>
          <Text style={styles.droneModel}>Pin: {item.battery}%</Text>
        </View>
        <Ionicons name={icon} size={24} color={statusColor} />
      </View>
      <View style={styles.cardFooter}>
        <Text style={styles.statusText}>Trạng thái: {item.status.toUpperCase()}</Text>
      </View>
    </View>
  );
}

export default function DroneTrackingTab() {
  const { filteredDrones, statusCounts, searchTerm, setSearchTerm } = useDrones();

  return (
    <FlatList
      data={filteredDrones}
      keyExtractor={(item) => item.drone_id.toString()}
      renderItem={({ item }) => <DroneCard item={item} />}
      style={styles.container}
      ListHeaderComponent={
        <>
          <View style={styles.searchSection}>
            <Ionicons name="search" size={20} color="#666" style={styles.searchIcon} />
            <TextInput
              style={styles.searchInput}
              placeholder="Tìm kiếm drone..."
              value={searchTerm}
              onChangeText={setSearchTerm}
            />
          </View>
          <StatsDisplay counts={statusCounts} />
        </>
      }
      ListEmptyComponent={<Text style={{textAlign:'center', marginTop: 20}}>Không tìm thấy drone</Text>}
    />
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f4f4f4' },
  searchSection: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#fff', borderRadius: 8, margin: 16, paddingHorizontal: 10 },
  searchIcon: { marginRight: 8 },
  searchInput: { flex: 1, height: 40, fontSize: 16 },
  statsContainer: { flexDirection: 'row', justifyContent: 'space-around', backgroundColor: '#fff', padding: 16, marginHorizontal: 16, borderRadius: 8, marginBottom: 16 },
  statItem: { alignItems: 'center' },
  statLabel: { fontSize: 12, color: '#666' },
  statValue: { fontSize: 18, fontWeight: 'bold', marginTop: 4 },
  card: { backgroundColor: '#fff', borderRadius: 8, padding: 16, marginHorizontal: 16, marginBottom: 12 },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between' },
  cardInfo: { flex: 1 },
  droneName: { fontSize: 16, fontWeight: 'bold' },
  droneModel: { fontSize: 12, color: '#666', marginTop: 4 },
  cardFooter: { marginTop: 12, paddingTop: 12, borderTopWidth: 1, borderTopColor: '#eee' },
  statusText: { fontSize: 14, fontWeight: '500' },
});