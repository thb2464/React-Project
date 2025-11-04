import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
} from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';
import { useNavigation } from '@react-navigation/native';
import { ProfileScreenNavigationProp } from '../navigation/types';
import { useAuth } from '@fastfoodordering/hooks';

// --- Reusable list item component ---
type ProfileRowProps = {
  icon: React.ComponentProps<typeof Ionicons>['name'];
  title: string;
  onPress: () => void;
  color?: string;
};

const ProfileRow: React.FC<ProfileRowProps> = ({
  icon,
  title,
  onPress ,
  color = '#333',
}) => (
  <TouchableOpacity style={styles.row} onPress={onPress}>
    <Ionicons name={icon} size={24} color={color} />
    <Text style={[styles.rowText, { color }]}>{title}</Text>
    <Ionicons name="chevron-forward-outline" size={24} color="#ccc" />
  </TouchableOpacity>
);

// --- Main Profile Screen ---
export default function ProfileScreen() {
  const navigation = useNavigation<ProfileScreenNavigationProp>();
  const { logout } = useAuth();
  const handleLogout = () => {logout()  
  }

  return (
    <ScrollView style={styles.container}>
      {/* 1. Profile Header */}
      <View style={styles.header}>
        <Image
          style={styles.avatar}
          source={{ uri: 'https://i.pravatar.cc/150' }} // Placeholder avatar
        />
        <Text style={styles.name}>Not justB</Text>
        <Text style={styles.email}>not.justB@example.com</Text>
      </View>

      {/* 2. Menu Options */}
      <View style={styles.menuGroup}>
        <ProfileRow
          icon="person-outline"
          title="Edit Profile"
          onPress={() => {}}
        />
        <ProfileRow
          icon="settings-outline"
          title="Settings"
          onPress={() => {}}
        />
        <ProfileRow
          icon="card-outline"
          title="Payment Methods"
          onPress={() => {}}
        />
        <ProfileRow
          icon="help-circle-outline"
          title="Support"
          onPress={() => navigation.navigate('HomeTab', { screen: 'Support' })}
        />
        <ProfileRow
          icon="podium-outline"
          title="Restaurant Dashboard"
          onPress={() => navigation.navigate('HomeTab', { screen: 'RestaurantDashboard' })}
        />

      </View>

      {/* 3. Logout Button */}
      <View style={styles.menuGroup}>
        <ProfileRow
          icon="log-out-outline"
          title="Log Out"
          onPress={handleLogout}
          color="#FF3B30" // Red color for logout
        />
      </View>
    </ScrollView>
  );
}

// 4. Add the Styles
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f4f4f4',
  },
  header: {
    backgroundColor: '#fff',
    padding: 24,
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
  },
  name: {
    fontSize: 22,
    fontWeight: 'bold',
    marginTop: 12,
  },
  email: {
    fontSize: 16,
    color: '#666',
    marginTop: 4,
  },
  menuGroup: {
    backgroundColor: '#fff',
    marginTop: 24,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  rowText: {
    flex: 1,
    fontSize: 16,
    marginLeft: 16,
  },
});