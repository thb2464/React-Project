import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TextInput,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import { useDrones } from '@fastfoodordering/hooks';
import { Drone } from '@fastfoodordering/types';
import Ionicons from '@expo/vector-icons/Ionicons';

// --- Header Component (for stats) ---
function StatsDisplay({ counts }: { counts: any }) {
  return (
    <View style={styles.statsContainer}>
      <View style={styles.statItem}>
        <Text style={styles.statLabel}>Available</Text>
        <Text style={[styles.statValue, { color: '#34C759' }]}>
          {counts.available}
        </Text>
      </View>
      <View style={styles.statItem}>
        <Text style={styles.statLabel}>Delivering</Text>
        <Text style={[styles.statValue, { color: '#007AFF' }]}>
          {counts.delivering}
        </Text>
      </View>
      <View style={styles.statItem}>
        <Text style={styles.statLabel}>Offline</Text>
        <Text style={[styles.statValue, { color: '#FF3B30' }]}>
          {counts.offline}
        </Text>
      </View>
      <View style={styles.statItem}>
        <Text style={styles.statLabel}>Total</Text>
        <Text style={styles.statValue}>{counts.total}</Text>
      </View>
    </View>
  );
}

// --- Filter Component (for tabs) ---
function FilterTabs({ filterStatus, setFilterStatus }: { filterStatus: string, setFilterStatus: (status: string) => void }) {
  const filters = ['all', 'available', 'delivering', 'offline'];
  return (
    <View style={styles.filterContainer}>
      {filters.map((filter) => (
        <TouchableOpacity
          key={filter}
          style={[
            styles.filterButton,
            filterStatus === filter && styles.filterButtonActive,
          ]}
          onPress={() => setFilterStatus(filter)}
        >
          <Text
            style={[
              styles.filterText,
              filterStatus === filter && styles.filterTextActive,
            ]}
          >
            {filter.charAt(0).toUpperCase() + filter.slice(1)}
          </Text>
        </TouchableOpacity>
      ))}
    </View>
  );
}

// --- Drone Card Component ---
function DroneCard({ item }: { item: Drone }) {
  const statusColor =
    item.status === 'Available'
      ? '#34C759'
      : item.status === 'Delivering'
      ? '#007AFF'
      : '#FF3B30';
  const icon =
    item.status === 'Available'
      ? 'checkmark-circle'
      : item.status === 'Delivering'
      ? 'airplane'
      : 'warning';

  return (
    <View style={styles.card}>
      <View style={styles.cardHeader}>
        <View style={styles.cardInfo}>
          <Text style={styles.droneName}>{item.name}</Text>
          <Text style={styles.droneModel}>
            {item.model} - {item.license}
          </Text>
        </View>
        <Ionicons name={icon} size={24} color={statusColor} />
      </View>
      <View style={styles.cardFooter}>
        <Text style={styles.statsText}>⭐ {item.rating}</Text>
        <Text style={styles.statsText}>${item.earnings}</Text>
        <Text style={styles.statsText}>{item.distance} mi</Text>
      </View>
    </View>
  );
}

// --- Main Screen Component ---
export default function DroneTrackingTab() {
  const {
    filteredDrones,
    statusCounts,
    filterStatus,
    setFilterStatus,
    searchTerm,
    setSearchTerm,
  } = useDrones();

  return (
    <FlatList
      data={filteredDrones}
      keyExtractor={(item) => item.id}
      renderItem={({ item }) => <DroneCard item={item} />}
      style={styles.container}
      ListHeaderComponent={
        <>
          <View style={styles.searchSection}>
            <Ionicons name="search" size={20} color="#666" style={styles.searchIcon} />
            <TextInput
              style={styles.searchInput}
              placeholder="Search drones..."
              value={searchTerm}
              onChangeText={setSearchTerm}
            />
          </View>
          <StatsDisplay counts={statusCounts} />
          <FilterTabs
            filterStatus={filterStatus}
            setFilterStatus={setFilterStatus}
          />
        </>
      }
    />
  );
}

// --- Styles ---
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f4f4f4',
  },
  searchSection: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 8,
    margin: 16,
    paddingHorizontal: 10,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    height: 40,
    fontSize: 16,
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    backgroundColor: '#fff',
    padding: 16,
    marginHorizontal: 16,
    borderRadius: 8,
  },
  statItem: {
    alignItems: 'center',
  },
  statLabel: {
    fontSize: 12,
    color: '#666',
  },
  statValue: {
    fontSize: 18,
    fontWeight: 'bold',
    marginTop: 4,
  },
  filterContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    padding: 16,
  },
  filterButton: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 15,
    backgroundColor: '#fff',
  },
  filterButtonActive: {
    backgroundColor: '#000',
  },
  filterText: {
    color: '#333',
    fontWeight: '500',
  },
  filterTextActive: {
    color: '#fff',
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 16,
    marginHorizontal: 16,
    marginBottom: 12,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  cardInfo: {
    flex: 1,
  },
  droneName: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  droneModel: {
    fontSize: 12,
    color: '#666',
    marginTop: 4,
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#eee',
    paddingTop: 12,
  },
  statsText: {
    fontSize: 14,
    fontWeight: '500',
  },
});