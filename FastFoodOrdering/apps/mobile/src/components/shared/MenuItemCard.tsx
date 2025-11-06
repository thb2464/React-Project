import React from 'react';
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';

// --- SHARED IMPORT ---
import { MenuItemType } from '@fastfoodordering/types';
// --- END SHARED IMPORT ---

interface Props {
  item: MenuItemType;
}

function MenuItemCard({ item }: Props) {
  const handleAddToCart = () => {
    // This logic can be shared or implemented natively
    console.log(`Added ${item.name} to cart`);
  };

  return (
    // --- 1. NATIVE UI (THE "FACE") ---
    <View style={styles.card}>
      <Image source={{ uri: item.image }} style={styles.cardImage} />
      <View style={styles.cardBody}>
        <Text style={styles.cardTitle} numberOfLines={1}>
          {item.name}
        </Text>
        <Text style={styles.cardDescription} numberOfLines={2}>
          {item.description}
        </Text>
        <View style={styles.cardFooter}>
          <Text style={styles.cardPrice}>${item.discountedPrice.toFixed(2)}</Text>
          <TouchableOpacity style={styles.addToCartBtn} onPress={handleAddToCart}>
            <Text style={styles.addToCartBtnText}>Add</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}

// --- 2. STYLING (THE CSS REPLACEMENT) ---
const styles = StyleSheet.create({
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    marginVertical: 8, // Use vertical margin for a list
    marginHorizontal: 16,
    elevation: 3, // Android shadow
    shadowColor: '#000', // iOS shadow
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    overflow: 'hidden', // Ensures image corners are rounded
  },
  cardImage: {
    width: '100%',
    height: 150,
  },
  cardBody: {
    padding: 12,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  cardDescription: {
    fontSize: 14,
    color: '#666',
    marginBottom: 8,
    height: 35, // Ensures consistent card height
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 8,
  },
  cardPrice: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  addToCartBtn: {
    backgroundColor: '#FF6347',
    paddingVertical: 8,
    paddingHorizontal: 20,
    borderRadius: 20,
  },
  addToCartBtnText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: 'bold',
  },
});

export default MenuItemCard;