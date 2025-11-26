import React, { useState } from 'react';
import {
  StyleSheet,
  View,
  Text,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useMenu } from '@fastfoodordering/hooks';
import MenuItemCard from '../components/shared/MenuItemCard';
import { MenuScreenNavigationProp } from '../navigation/types';

function MenuScreen() {
  const { items, categories, isLoading, error } = useMenu();
  const navigation = useNavigation<MenuScreenNavigationProp>();
  
  const [selectedCategory, setSelectedCategory] = useState('All');

  // Filter items based on selection
  const filteredItems = items.filter((item) => {
    if (selectedCategory === 'All') return true;
    return item.category === selectedCategory;
  });

  if (isLoading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#000" />
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.center}>
        <Text style={{ color: 'red' }}>Error loading menu.</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View>
        <FlatList
          data={categories}
          horizontal={true}
          showsHorizontalScrollIndicator={false}
          keyExtractor={(item) => item}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={[
                styles.categoryButton,
                selectedCategory === item && styles.categoryButtonActive,
              ]}
              onPress={() => setSelectedCategory(item)}
            >
              <Text
                style={[
                  styles.categoryText,
                  selectedCategory === item && styles.categoryTextActive,
                ]}
              >
                {item}
              </Text>
            </TouchableOpacity>
          )}
          contentContainerStyle={styles.categoryListContainer}
        />
      </View>

      <View style={{ flex: 1 }}>
        <FlatList
          data={filteredItems}
          keyExtractor={(item) => item.item_id.toString()}
          renderItem={({ item }) => <MenuItemCard item={item} />}
          contentContainerStyle={styles.menuListContainer}
        />

        <TouchableOpacity
          style={styles.checkoutButton}
          onPress={() => navigation.navigate('Checkout')}
        >
          <Text style={styles.checkoutButtonText}>Go to Checkout</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f4f4f4',
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  categoryListContainer: {
    paddingVertical: 10,
    paddingHorizontal: 16,
    backgroundColor: '#fff',
  },
  categoryButton: {
    backgroundColor: '#fff',
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 20,
    marginRight: 10,
    borderWidth: 1,
    borderColor: '#ddd',
  },
  categoryButtonActive: {
    backgroundColor: '#000000', 
    borderColor: '#000000',
  },
  categoryText: {
    fontWeight: 'bold',
    color: '#333',
  },
  categoryTextActive: {
    color: '#FFFFFF',
  },
  menuListContainer: {
    paddingBottom: 20,
  },
  checkoutButton: {
    backgroundColor: '#34C759',
    padding: 16,
    margin: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  checkoutButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
});

export default MenuScreen;