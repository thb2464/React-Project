// --- 1. Helper Interfaces (UI only) ---
export interface Category {
  icon: string;
  name: string;
}

// --- 2. Database Types (Match your .sql file exactly) ---

// Matches 'users' table
export type User = {
  user_id: number;
  full_name: string;
  email: string;
  role: 'customer' | 'owner' | 'admin';
};

// Matches 'food_items' table
export type MenuItemType = {
  item_id: number;       // Was 'id'
  restaurant_id: number; // Added to link to restaurant
  name: string;
  category: string;      // Was part of tags
  img_url: string;       // Was 'image'
  price: number;         // Was 'discountedPrice'
  is_available: boolean; // New DB field
  
  // Optional UI fields (can be calculated or null)
  description?: string;
  customizationConfig?: CustomizationGroup[];
};

// Matches 'orders' table structure
export type Order = {
  order_id: number;
  user_id: number;
  restaurant_id: number;
  total_amount: number;
  order_status: 'pending' | 'confirmed' | 'preparing' | 'delivering' | 'delivered' | 'cancelled';
  delivery_address: string;
  created_at: string;
  // Joined data
  items?: OrderItem[];
};

export type OrderItem = {
  item_id: number;
  quantity: number;
  price: number; // Snapshot of price at time of order
};

// --- 3. Legacy/UI Types (Keep these for now to avoid breaking UI components) ---

export interface CustomizationOption {
  id: string;
  name: string;
  price: number;
  ingredients?: string;
  image?: string;
}

export interface CustomizationGroup {
  id: string;
  title: string;
  required: boolean;
  type: 'radio' | 'checkbox';
  defaultOptionId?: string;
  options: CustomizationOption[];
}

export interface MenuCategoryType {
  id: string;
  name: string;
  description?: string;
  items: MenuItemType[];
}

export type Drone = {
  drone_id: number;
  status: 'idle' | 'in_flight' | 'charging' | 'maintenance';
  battery_level: number;
};