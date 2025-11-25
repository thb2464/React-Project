import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image, Alert } from 'react-native';
import { useAppState } from '@fastfoodordering/store';
import Ionicons from '@expo/vector-icons/Ionicons';

// Default Avatar if none exists
const DEFAULT_AVATAR = 'https://ui-avatars.com/api/?background=0D8ABC&color=fff&size=128&name=';

export default function ProfileScreen() {
  const { user, logout } = useAppState();

  const handleLogout = () => {
    Alert.alert(
      'Đăng xuất',
      'Bạn có chắc chắn muốn đăng xuất?',
      [
        { text: 'Hủy', style: 'cancel' },
        { 
          text: 'Đồng ý', 
          style: 'destructive', 
          onPress: () => logout() 
        },
      ]
    );
  };

  if (!user) return null;

  return (
    <View style={styles.container}>
      {/* Header Card */}
      <View style={styles.header}>
        <View style={styles.avatarContainer}>
          <Image 
            source={{ uri: DEFAULT_AVATAR + user.full_name.replace(' ', '+') }} 
            style={styles.avatar} 
          />
        </View>
        <Text style={styles.name}>{user.full_name}</Text>
        <Text style={styles.email}>{user.email}</Text>
        <View style={styles.badge}>
          <Text style={styles.badgeText}>{user.role.toUpperCase()}</Text>
        </View>
      </View>

      {/* Menu Options */}
      <View style={styles.menu}>
        <TouchableOpacity style={styles.menuItem}>
          <Ionicons name="location-outline" size={24} color="#333" />
          <Text style={styles.menuText}>Địa chỉ đã lưu</Text>
          <Ionicons name="chevron-forward" size={24} color="#ccc" />
        </TouchableOpacity>
        
        <TouchableOpacity style={styles.menuItem}>
          <Ionicons name="card-outline" size={24} color="#333" />
          <Text style={styles.menuText}>Phương thức thanh toán</Text>
          <Ionicons name="chevron-forward" size={24} color="#ccc" />
        </TouchableOpacity>

        <TouchableOpacity style={styles.menuItem}>
          <Ionicons name="help-circle-outline" size={24} color="#333" />
          <Text style={styles.menuText}>Hỗ trợ</Text>
          <Ionicons name="chevron-forward" size={24} color="#ccc" />
        </TouchableOpacity>
      </View>

      {/* Logout Button */}
      <TouchableOpacity style={styles.logoutBtn} onPress={handleLogout}>
        <Ionicons name="log-out-outline" size={24} color="#FF3B30" />
        <Text style={styles.logoutText}>Đăng xuất</Text>
      </TouchableOpacity>

      <Text style={styles.version}>Version 1.0.0 (Demo Build)</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f4f4f4' },
  header: { backgroundColor: '#fff', alignItems: 'center', padding: 24, borderBottomLeftRadius: 24, borderBottomRightRadius: 24, elevation: 4, shadowColor: '#000', shadowOffset: {width:0, height:2}, shadowOpacity: 0.1, shadowRadius: 4 },
  avatarContainer: { marginBottom: 16, elevation: 5, shadowColor: '#000', shadowOffset: {width:0, height:2}, shadowOpacity: 0.2, shadowRadius: 4 },
  avatar: { width: 100, height: 100, borderRadius: 50, borderWidth: 4, borderColor: '#fff' },
  name: { fontSize: 22, fontWeight: 'bold', color: '#333' },
  email: { fontSize: 14, color: '#666', marginBottom: 8 },
  badge: { backgroundColor: '#e1f5fe', paddingHorizontal: 12, paddingVertical: 4, borderRadius: 12 },
  badgeText: { color: '#0288d1', fontSize: 10, fontWeight: 'bold' },
  
  menu: { marginTop: 24, backgroundColor: '#fff', marginHorizontal: 16, borderRadius: 12 },
  menuItem: { flexDirection: 'row', alignItems: 'center', padding: 16, borderBottomWidth: 1, borderBottomColor: '#f4f4f4' },
  menuText: { flex: 1, marginLeft: 16, fontSize: 16, color: '#333' },
  
  logoutBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', backgroundColor: '#fff', marginTop: 24, marginHorizontal: 16, padding: 16, borderRadius: 12 },
  logoutText: { marginLeft: 8, color: '#FF3B30', fontSize: 16, fontWeight: 'bold' },
  
  version: { textAlign: 'center', color: '#999', marginTop: 24, fontSize: 12 },
});