/**
 * Interface này định nghĩa cấu trúc dữ liệu thô trả về từ API backend.
 * Tên các thuộc tính khớp với tên các cột trong database.
 */
export interface ApiMenuItem {
  item_id: string;
  name: string;
  description: string | null;
  price: string;
  img_url: string | null;
  category: string;
  is_available: boolean;
  veg?: boolean;
}

/**
 * Interface này định nghĩa cấu trúc dữ liệu đã được xử lý
 * để sử dụng trong các component React ở frontend.
 */
export interface MenuItemType {
  id: string;
  name: string;
  image: string;
  discountedPrice: number;
  originalPrice: number;
  description: string;
  tags: string[];
  rating: number;
  time: string;
  calories: number;
  isPopular: boolean;
  veg: boolean;
  // Customization options from JSONB
  options?: any[];
}

export type UserRole = 'customer' | 'owner' | 'admin';

export interface User {
  id: string;           // user_id from DB
  name: string;         // full_name
  email: string;
  role: UserRole;
  token?: string;       // JWT
}