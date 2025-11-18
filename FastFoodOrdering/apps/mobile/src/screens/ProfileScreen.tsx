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
import { useAppState } from '@fastfoodordering/store';

type ProfileRowProps = {
  icon: React.ComponentProps<typeof Ionicons>['name'];
  title: string;
  onPress: () => void;
  color?: string;
};

const ProfileRow: React.FC<ProfileRowProps> = ({
  icon,
  title,
  onPress,
  color = '#333',
}) => (
  <TouchableOpacity style={styles.row} onPress={onPress}>
    <Ionicons name={icon} size={24} color={color} />
    <Text style={[styles.rowText, { color }]}>{title}</Text>
    <Ionicons name="chevron-forward-outline" size={24} color="#ccc" />
  </TouchableOpacity>
);

export default function ProfileScreen() {
  const navigation = useNavigation<ProfileScreenNavigationProp>();
  const { logout, user } = useAppState();

  const handleLogout = () => {
    logout();
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Image
          style={styles.avatar}
          source={{ uri: 'https://i.pravatar.cc/150' }}
        />
        <Text style={styles.name}>{user?.full_name || 'User'}</Text>
        <Text style={styles.email}>{user?.email || 'email@example.com'}</Text>
      </View>

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
      </View>

      <View style={styles.menuGroup}>
        <ProfileRow
          icon="log-out-outline"
          title="Log Out"
          onPress={handleLogout}
          color="#FF3B30"
        />
      </View>
    </ScrollView>
  );
}

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