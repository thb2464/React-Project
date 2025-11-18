import React from 'react';
import {
  StyleSheet,
  View,
  Text,
  FlatList,
  TouchableOpacity,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useMenu } from '@fastfoodordering/hooks';
import { Category } from '@fastfoodordering/types';
import MenuItemCard from '../components/shared/MenuItemCard';
import { MenuScreenNavigationProp } from '../navigation/types';

function MenuScreen() {
  const {
    filteredItems,
    categories,
    selectedCategory,
    handleCategoryChange,
  } = useMenu();
  const navigation = useNavigation<MenuScreenNavigationProp>();

  return (
    <View style={styles.container}>
      <View>
        <FlatList
          data={categories as Category[]}
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