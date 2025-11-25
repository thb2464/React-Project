import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  View,
  Text,
  Image,
  TouchableOpacity,
  FlatList,
  ActivityIndicator,
  TextInput,
  Modal,
  TouchableWithoutFeedback
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useMenu } from '@fastfoodordering/hooks';
import { useAppState } from '@fastfoodordering/store';
import Ionicons from '@expo/vector-icons/Ionicons';

const API_URL = 'https://chiasmal-puffingly-etsuko.ngrok-free.dev'; 
const PLACEHOLDER_IMAGE = 'https://placehold.co/400x300/png?text=Food';

const formatPrice = (price: number) => {
  return new Intl.NumberFormat('vi-VN').format(price) + 'đ';
};

const MenuGridItem = ({ item, onPressImage, onAddQuick }: any) => {
  const [imgError, setImgError] = useState(false);
  const imageUrl = (!imgError && item.img_url) 
    ? (item.img_url.startsWith('http') ? item.img_url : `${API_URL}/uploads/${item.img_url}`)
    : PLACEHOLDER_IMAGE;

  return (
    <View style={styles.card}>
      <TouchableOpacity onPress={onPressImage}>
        <Image 
            source={{ uri: imageUrl, headers: { "ngrok-skip-browser-warning": "true" } }} 
            style={styles.cardImage} resizeMode="cover" onError={() => setImgError(true)}
        />
      </TouchableOpacity>
      <View style={styles.cardContent}>
        <TouchableOpacity onPress={onPressImage}>
            <View>
            <Text style={styles.cardTitle} numberOfLines={1}>{item.name}</Text>
            <Text style={styles.cardCategory}>{item.category}</Text>
            </View>
        </TouchableOpacity>
        <View style={styles.cardFooter}>
          <Text style={styles.cardPrice}>{formatPrice(item.price)}</Text>
          <TouchableOpacity style={styles.addButton} onPress={onAddQuick}>
            <Ionicons name="add" size={20} color="#fff" />
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
};

const ItemDetailModal = ({ visible, item, onClose, onAddToCart }: any) => {
  const [quantity, setQuantity] = useState(1);
  const [imgError, setImgError] = useState(false);

  useEffect(() => { if (visible) setQuantity(1); }, [visible]);
  if (!item) return null;

  const imageUrl = (!imgError && item.img_url) 
    ? (item.img_url.startsWith('http') ? item.img_url : `${API_URL}/uploads/${item.img_url}`)
    : PLACEHOLDER_IMAGE;

  const total = Number(item.price) * quantity;

  return (
    <Modal animationType="slide" transparent={true} visible={visible} onRequestClose={onClose}>
      <TouchableWithoutFeedback onPress={onClose}>
        <View style={styles.modalOverlay}>
          <TouchableWithoutFeedback>
            <View style={styles.modalContent}>
              <View style={styles.modalHandle} />
              <Image source={{ uri: imageUrl, headers: { "ngrok-skip-browser-warning": "true" } }} style={styles.modalImage} resizeMode="cover" onError={() => setImgError(true)} />
              <View style={styles.modalBody}>
                <View style={styles.modalHeaderRow}>
                    <Text style={styles.modalTitle}>{item.name}</Text>
                    <Text style={styles.modalPrice}>{formatPrice(item.price)}</Text>
                </View>
                <Text style={styles.modalDesc}>{item.description || "Món ăn ngon tuyệt, được chế biến tươi mới dành cho bạn."}</Text>
                <View style={styles.qtyContainer}>
                    <Text style={styles.qtyLabel}>Số lượng</Text>
                    <View style={styles.qtyControls}>
                        <TouchableOpacity style={styles.qtyBtn} onPress={() => setQuantity(Math.max(1, quantity - 1))}><Ionicons name="remove" size={20} color="#000" /></TouchableOpacity>
                        <Text style={styles.qtyText}>{quantity}</Text>
                        <TouchableOpacity style={styles.qtyBtn} onPress={() => setQuantity(quantity + 1)}><Ionicons name="add" size={20} color="#000" /></TouchableOpacity>
                    </View>
                </View>
                <TouchableOpacity style={styles.modalAddBtn} onPress={() => onAddToCart(item, quantity)}>
                    <Text style={styles.modalAddBtnText}>Thêm vào giỏ - {formatPrice(total)}</Text>
                </TouchableOpacity>
              </View>
            </View>
          </TouchableWithoutFeedback>
        </View>
      </TouchableWithoutFeedback>
    </Modal>
  );
};

const CartToast = ({ visible, lastItem, count }: any) => {
    if (!visible) return null;
    return (
        <View style={styles.toastContainer}>
            <View style={styles.toastContent}>
                <Ionicons name="checkmark-circle" size={24} color="#34C759" />
                <View style={{marginLeft: 10, flex: 1}}>
                    <Text style={styles.toastTitle}>Đã thêm vào giỏ!</Text>
                    <Text style={styles.toastSubtitle}>{lastItem}</Text>
                </View>
                <View style={styles.toastBadge}>
                    <Text style={styles.toastBadgeText}>{count} món</Text>
                </View>
            </View>
        </View>
    );
}

export default function HomePage() {
  const navigation = useNavigation<any>();
  const { user, addToCart, cart } = useAppState();
  const { items, categories, isLoading, error } = useMenu();
  
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [searchText, setSearchText] = useState('');

  const [modalVisible, setModalVisible] = useState(false);
  const [selectedItem, setSelectedItem] = useState<any>(null);
  const [toastVisible, setToastVisible] = useState(false);
  const [lastAddedName, setLastAddedName] = useState('');

  const cartCount = cart.reduce((sum, i) => sum + i.quantity, 0);

  const filteredItems = items.filter((item) => {
    const matchesCategory = selectedCategory === 'All' || item.category === selectedCategory;
    const matchesSearch = item.name.toLowerCase().includes(searchText.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const handlePressItem = (item: any) => { setSelectedItem(item); setModalVisible(true); };
  const triggerToast = (itemName: string) => { setLastAddedName(itemName); setToastVisible(true); setTimeout(() => setToastVisible(false), 3000); };
  const handleQuickAdd = (item: any) => { addToCart(item); triggerToast(item.name); };
  const handleModalAdd = (item: any, quantity: number) => { for(let i=0; i<quantity; i++) addToCart(item); setModalVisible(false); triggerToast(`${quantity}x ${item.name}`); };

  if (isLoading) return <View style={styles.center}><ActivityIndicator size="large" color="#000" /></View>;
  if (error) return <View style={styles.center}><Text style={{color: 'red'}}>Lỗi kết nối</Text></View>;

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View>
          <Text style={styles.greeting}>Chào, {user?.full_name || 'Khách'}</Text>
          <Text style={styles.subtitle}>Bạn đói chưa?</Text>
        </View>
        <View style={{flexDirection: 'row', alignItems: 'center'}}>
            <TouchableOpacity style={styles.headerIconBtn} onPress={() => navigation.navigate('Checkout')}>
                <Ionicons name="cart-outline" size={30} color="#333" />
                {cartCount > 0 && (
                    <View style={styles.headerBadge}>
                        <Text style={styles.headerBadgeText}>{cartCount > 99 ? '99+' : cartCount}</Text>
                    </View>
                )}
            </TouchableOpacity>
            <TouchableOpacity style={[styles.headerIconBtn, { marginLeft: 10 }]} onPress={() => navigation.navigate('ProfileTab')}>
                <Ionicons name="person-circle-outline" size={35} color="#333" />
            </TouchableOpacity>
        </View>
      </View>

      <View style={styles.searchContainer}>
        <Ionicons name="search" size={20} color="#666" style={{ marginRight: 8 }} />
        <TextInput placeholder="Tìm món ăn..." style={styles.searchInput} value={searchText} onChangeText={setSearchText} />
      </View>

      <View>
        <FlatList
          data={categories}
          renderItem={({ item }) => (
            <TouchableOpacity style={[styles.categoryChip, selectedCategory === item && styles.categoryChipSelected]} onPress={() => setSelectedCategory(item)}>
              <Text style={[styles.categoryText, selectedCategory === item && styles.categoryTextSelected]}>{item === 'All' ? 'Tất cả' : item}</Text>
            </TouchableOpacity>
          )}
          keyExtractor={(item) => item}
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.categoriesList}
        />
      </View>

      <FlatList
        data={filteredItems}
        renderItem={({ item }) => (
            <MenuGridItem item={item} onPressImage={() => handlePressItem(item)} onAddQuick={() => handleQuickAdd(item)}/>
        )}
        keyExtractor={(item) => item.item_id.toString()}
        numColumns={2}
        contentContainerStyle={styles.menuList}
        columnWrapperStyle={{ justifyContent: 'space-between' }}
        showsVerticalScrollIndicator={false}
      />

      <ItemDetailModal visible={modalVisible} item={selectedItem} onClose={() => setModalVisible(false)} onAddToCart={handleModalAdd} />
      <CartToast visible={toastVisible} lastItem={lastAddedName} count={cartCount} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff', paddingTop: 50, paddingHorizontal: 16 },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 },
  greeting: { fontSize: 20, fontWeight: 'bold' },
  subtitle: { color: '#666', fontSize: 14 },
  headerIconBtn: { position: 'relative', padding: 4 },
  headerBadge: { position: 'absolute', top: -2, right: -2, backgroundColor: 'red', borderRadius: 10, minWidth: 20, height: 20, justifyContent: 'center', alignItems: 'center', borderWidth: 2, borderColor: '#fff' },
  headerBadgeText: { color: '#fff', fontSize: 10, fontWeight: 'bold' },
  searchContainer: { flexDirection: 'row', backgroundColor: '#f4f4f4', padding: 12, borderRadius: 12, alignItems: 'center', marginBottom: 20 },
  searchInput: { flex: 1, fontSize: 16 },
  categoriesList: { paddingBottom: 20 },
  categoryChip: { paddingHorizontal: 20, paddingVertical: 10, backgroundColor: '#f4f4f4', borderRadius: 20, marginRight: 10 },
  categoryChipSelected: { backgroundColor: '#000' },
  categoryText: { fontWeight: '600', color: '#333' },
  categoryTextSelected: { color: '#fff' },
  menuList: { paddingBottom: 100 },
  card: { width: '48%', backgroundColor: '#fff', borderRadius: 16, marginBottom: 16, shadowColor: "#000", shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 4, elevation: 3 },
  cardImage: { width: '100%', height: 120, borderTopLeftRadius: 16, borderTopRightRadius: 16, backgroundColor: '#eee' },
  cardContent: { padding: 12 },
  cardTitle: { fontSize: 16, fontWeight: 'bold', marginBottom: 4 },
  cardCategory: { fontSize: 12, color: '#888', marginBottom: 8 },
  cardFooter: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  cardPrice: { fontSize: 16, fontWeight: 'bold' },
  addButton: { backgroundColor: '#000', padding: 6, borderRadius: 20 },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
  modalContent: { 
    backgroundColor: '#fff', 
    height: '80%',
    borderTopLeftRadius: 24, 
    borderTopRightRadius: 24, 
    overflow: 'hidden' 
  },
  modalHandle: { width: 40, height: 5, backgroundColor: '#ccc', borderRadius: 3, alignSelf: 'center', marginTop: 10 },
  modalImage: { width: '100%', height: 250, marginTop: 10 },
  modalBody: { 
    padding: 24, 
    flex: 1, 
  },
  modalHeaderRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 },
  modalTitle: { fontSize: 24, fontWeight: 'bold', flex: 1 },
  modalPrice: { fontSize: 24, fontWeight: 'bold', color: '#34C759' },
  modalDesc: { fontSize: 16, color: '#666', lineHeight: 24, marginBottom: 24 },
  qtyContainer: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 },
  qtyLabel: { fontSize: 18, fontWeight: '600' },
  qtyControls: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#f4f4f4', borderRadius: 30, padding: 4 },
  qtyBtn: { width: 36, height: 36, backgroundColor: '#fff', borderRadius: 18, justifyContent: 'center', alignItems: 'center', elevation: 2 },
  qtyText: { marginHorizontal: 16, fontSize: 18, fontWeight: 'bold' },
  modalAddBtn: { 
    backgroundColor: '#000', 
    padding: 18, 
    borderRadius: 16, 
    alignItems: 'center',
    marginTop: 'auto',
    marginBottom: 40, 
  },
  modalAddBtnText: { color: '#fff', fontSize: 18, fontWeight: 'bold' },
  toastContainer: { position: 'absolute', bottom: 30, left: 20, right: 20, alignItems: 'center' },
  toastContent: { flexDirection: 'row', backgroundColor: '#333', padding: 16, borderRadius: 12, alignItems: 'center', shadowColor: "#000", shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 4, elevation: 6 },
  toastTitle: { color: '#fff', fontWeight: 'bold', fontSize: 16 },
  toastSubtitle: { color: '#ccc', fontSize: 14 },
  toastBadge: { backgroundColor: '#FF3B30', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 12 },
  toastBadgeText: { color: '#fff', fontSize: 12, fontWeight: 'bold' },
});