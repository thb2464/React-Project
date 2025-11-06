import React from 'react';
import {
  StyleSheet,
  View,
  Text,
  ScrollView,
  Image,
  TouchableOpacity,
  FlatList,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { HomeScreenNavigationProp } from '../navigation/types';
import { categories, TOP_OFFERS } from '@fastfoodordering/data';
import { usePopularItems } from '@fastfoodordering/hooks';
import { Category } from '@fastfoodordering/types';

import MenuItemCard from '../components/shared/MenuItemCard';

function HomePage() {
  const popularItems = usePopularItems();
  const navigation = useNavigation<HomeScreenNavigationProp>();
  return (
    <ScrollView style={styles.container}>
      {/* Hero Section */}
      <View style={styles.hero}>
        <Text style={styles.heroTitle}>Delicious Food, Delivered Fast</Text>
        <Text style={styles.heroSubtitle}>
          Order from your favorite restaurants and get it delivered in minutes
        </Text>
        <TouchableOpacity
          style={styles.orderButton}
          onPress={() => navigation.navigate('Menu')}
        >
          <Text style={styles.orderButtonText}>Order Now</Text>
        </TouchableOpacity>
      </View>

      {/* Top Offers Section */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Top Offers</Text>
        <FlatList
          data={TOP_OFFERS}
          horizontal={true}
          showsHorizontalScrollIndicator={false}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <View style={styles.offerItem}>
              <Image source={{ uri: item.image }} style={styles.offerImage} />
              <Text>
                {item.title} - {item.price}
              </Text>
            </View>
          )}
        />
      </View>

      {/* Categories Section */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Popular Categories</Text>
        <FlatList
          data={categories as Category[]}
          horizontal={true}
          showsHorizontalScrollIndicator={false}
          keyExtractor={(item) => item.name}
          renderItem={({ item }) => (
            <View style={styles.categoryItem}>
              <Text style={styles.categoryIcon}>{item.icon}</Text>
              <Text>{item.name}</Text>
            </View>
          )}
        />
      </View>

      {/* Popular Items Section */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Popular Items</Text>
        {popularItems.map((item) => (
          <MenuItemCard key={item.id} item={item} />
        ))}
      </View>
    </ScrollView>
  );
}

// --- 3. STYLING ---
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f4f4f4',
  },
  hero: {
    backgroundColor: '#000000',
    padding: 24,
    alignItems: 'center',
  },
  heroTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#FFFFFF',
    textAlign: 'center',
  },
  heroSubtitle: {
    fontSize: 16,
    color: '#FFFFFF',
    textAlign: 'center',
    marginTop: 8,
  },
  orderButton: {
    backgroundColor: '#ffffffff',
    paddingVertical: 12,
    paddingHorizontal: 32,
    borderRadius: 6,
    borderWidth: 1,
    marginTop: 20,  
  },
  orderButtonText: {
    color: '#000000',
    fontSize: 16,
  },
  section: {
    marginTop: 20,
    paddingHorizontal: 16,
  },
  sectionTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 12,
  },
  offerItem: {
    marginRight: 16,
    width: 150,
  },
  offerImage: {
    width: 150,
    height: 100,
    borderRadius: 8,
  },
  categoryItem: {
    alignItems: 'center',
    marginRight: 20,
    width: 80,
  },
  categoryIcon: {
    fontSize: 30,
  },
});

export default HomePage;