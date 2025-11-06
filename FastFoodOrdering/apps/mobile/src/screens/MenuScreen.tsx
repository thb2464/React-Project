import React from 'react';
import {
  StyleSheet,
  View,
  Text,
  FlatList,
  TouchableOpacity,
} from 'react-native';

// Import our new hook and the components/types
import { useMenu } from '@fastfoodordering/hooks';
import { Category } from '@fastfoodordering/types';
import MenuItemCard from '../components/shared/MenuItemCard';
import { useNavigation } from '@react-navigation/native';
import { MenuScreenNavigationProp } from '../navigation/types';

function MenuScreen() {
  // 1. Get all logic hooks
  const {
    filteredItems,
    categories,
    selectedCategory,
    handleCategoryChange,
  } = useMenu();
  const navigation = useNavigation<MenuScreenNavigationProp>();
  // 2. Render the UI
  return (
  <View style={styles.container}>
    {/* Category List (Replaces Sidebar) */}
    <View>
      <FlatList
        data={categories as Category[]} // Cast as Category[]
        horizontal={true}
        showsHorizontalScrollIndicator={false}
        keyExtractor={(item) => item.name}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={[
              styles.categoryButton,
              selectedCategory === item.name && styles.categoryButtonActive,
            ]}
            onPress={() => handleCategoryChange(item.name)}
          >
            <Text
              style={[
                styles.categoryText,
                selectedCategory === item.name && styles.categoryTextActive,
              ]}
            >
              {item.name}
            </Text>
          </TouchableOpacity>
        )}
        contentContainerStyle={styles.categoryListContainer}
      />
    </View>

    {/* This new View allows the list and button to share space */}
    <View style={{ flex: 1 }}>
      {/* Menu Item List (Replaces Main Content) */}
      <FlatList
        data={filteredItems}
        keyExtractor={(item, index) => item.id + item.name + index}
        renderItem={({ item }) => <MenuItemCard item={item} />}
        contentContainerStyle={styles.menuListContainer}
      />

      {/* 3. ADD THIS CHECKOUT BUTTON */}
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

// 3. Add the Styles
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f4f4f4',
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