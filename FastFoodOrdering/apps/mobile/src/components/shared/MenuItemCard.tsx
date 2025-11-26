import React from 'react';
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';
import { MenuItemType } from '@fastfoodordering/types';
import { useAppState } from '@fastfoodordering/store';

interface Props {
  item: MenuItemType;
}

const REMOTE_API_URL = 'https://chiasmal-puffingly-etsuko.ngrok-free.dev/api';

const getImageUrl = (url?: string) => {
  if (!url) return 'https://via.placeholder.com/150';
  if (url.startsWith('http')) return url;
  return `${REMOTE_API_URL}/uploads/${url}`;
};

function MenuItemCard({ item }: Props) {
  const { addToCart } = useAppState();

  const getImageUrl = (url?: string) => {
    if (!url) return 'https://via.placeholder.com/150'; // Basic fallback
    if (url.startsWith('http')) return url;
    return `${REMOTE_API_URL}/uploads/${url}`;
  };

  return (
    <View style={styles.card}>
      <Image 
        source={{ 
          uri: getImageUrl(item.img_url),
          // THIS IS THE FIX: Pass the header to bypass Ngrok warning
          headers: { "ngrok-skip-browser-warning": "true" }
        }} 
        style={styles.cardImage} 
        resizeMode="cover"
      />
      
      {/* ... Rest of the component (Body, Title, Price, Buttons) ... */}
      <View style={styles.cardBody}>
        <Text style={styles.cardTitle} numberOfLines={1}>{item.name}</Text>
        <Text style={styles.cardDescription} numberOfLines={1}>{item.category}</Text>
        <View style={styles.cardFooter}>
            <Text style={styles.cardPrice}>${Number(item.price || 0).toFixed(2)}</Text>
            <TouchableOpacity style={styles.addToCartBtn} onPress={() => addToCart(item)}>
                <Text style={styles.addToCartBtnText}>Add</Text>
            </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}
const styles = StyleSheet.create({
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    marginVertical: 8,
    marginHorizontal: 16,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    overflow: 'hidden',
  },
  cardImage: {
    width: '100%',
    height: 150,
    backgroundColor: '#eee', // Gray background while loading
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
    height: 20, // Adjusted height
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