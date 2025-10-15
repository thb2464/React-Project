/**
 * Interface này định nghĩa cấu trúc dữ liệu thô trả về từ API backend.
 * Tên các thuộc tính khớp với tên các cột trong database.
 */
export interface ApiMenuItem {
  item_id: number;
  name: string;
  price: string; // PostgreSQL trả về kiểu decimal dưới dạng string
  img_url: string | null;
  description: string | null;
  category: string; // <-- SỬA LỖI: Thêm dòng này
}

/**
 * Interface này định nghĩa cấu trúc dữ liệu đã được xử lý
 * để sử dụng trong các component React ở frontend.
 */
export interface MenuItemType {
  id: number;
  name: string;
  image: string;
  discountedPrice: number;
  description: string;
  rating: number;
  time: string;
  calories: number;
  isPopular: boolean;
  tags: string[]; // category sẽ được đưa vào mảng này
}

