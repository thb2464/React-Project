import { ApiMenuItem, MenuItemType } from "../types";

// Địa chỉ của backend server.
const API_BASE_URL = 'http://localhost:3000/api';
// Địa chỉ gốc của server để lấy file tĩnh (ảnh)
const SERVER_BASE_URL = 'http://localhost:3000'; 

/**
 * Hàm chuyển đổi dữ liệu thô từ API sang định dạng mà frontend có thể hiển thị.
 * @param apiItem - Object dữ liệu món ăn trực tiếp từ API.
 * @returns Object dữ liệu món ăn đã được chuẩn hóa cho component React.
 */
const mapApiToFrontend = (apiItem: ApiMenuItem): MenuItemType => {
    const imageUrl = apiItem.img_url 
        ? `${SERVER_BASE_URL}/uploads/${apiItem.img_url}` 
        : 'https://placehold.co/600x400/F28400/white?text=Food+Image';

    return {
        id: apiItem.item_id,
        name: apiItem.name,
        image: imageUrl,
        discountedPrice: parseFloat(apiItem.price),
        description: apiItem.description || "Món ăn ngon tuyệt vời được chế biến bởi các đầu bếp hàng đầu.",
        tags: [apiItem.category], 
        rating: 4.5, // Dữ liệu giả định
        time: "20-25 min", // Dữ liệu giả định
        calories: 350, // Dữ liệu giả định
        isPopular: true, // Dữ liệu giả định
    };
};

/**
 * Hàm gọi API để lấy TẤT CẢ món ăn từ tất cả nhà hàng.
 * @returns Một Promise chứa mảng các món ăn đã được xử lý.
 */
export const fetchAllFoodItems = async (): Promise<MenuItemType[]> => {
    try {
        const response = await fetch(`${API_BASE_URL}/food-items`);
        
        if (!response.ok) {
            throw new Error(`Lỗi mạng: ${response.statusText}`);
        }

        const apiData: ApiMenuItem[] = await response.json();
        const frontendData = apiData.map(mapApiToFrontend);
        
        return frontendData;
    } catch (error) {
        console.error("Không thể lấy dữ liệu tất cả món ăn:", error);
        return []; 
    }
};


/**
 * Hàm gọi API để lấy danh sách món ăn của MỘT nhà hàng cụ thể.
 * @param restaurantId - ID của nhà hàng.
 * @returns Một Promise chứa mảng các món ăn đã được xử lý.
 */
export const fetchMenuForRestaurant = async (restaurantId: number): Promise<MenuItemType[]> => {
    try {
        const response = await fetch(`${API_BASE_URL}/restaurants/${restaurantId}/menu`);
        
        if (!response.ok) {
            throw new Error(`Lỗi mạng: ${response.statusText}`);
        }

        const apiData: ApiMenuItem[] = await response.json();
        const frontendData = apiData.map(mapApiToFrontend);
        
        return frontendData;
    } catch (error) {
        console.error(`Không thể lấy dữ liệu menu cho nhà hàng ${restaurantId}:`, error);
        return []; 
    }
};

