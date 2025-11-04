
export interface Category {
  icon: string;
  name: string;
}

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

export type MenuItemType = {
  id: string;
  name: string;
  description: string;
  originalPrice: number;
  discountedPrice: number; // This is the price we will use
  image: string;
  veg: boolean;
  customizationConfig?: CustomizationGroup[];
  tags: string[];
  isPopular?: boolean;
  rating: number;
  time: string;
  calories: number;
};

export interface MenuCategoryType {
  id: string;
  name: string;
  description: string;
  items: MenuItemType[];
}

// Types from your mockData file
export type OrderItem = {
  name: string;
  price: number;
};

export type Order = {
  id: string;
  date: string;
  status: 'Confirmed' | 'Preparing' | 'Ready' | 'Out for Delivery' | 'Delivered';
  droneName: string;
  items: OrderItem[];
  total: number;
};

export type Drone = {
  id: string;
  name: string;
  model: string;
  license: string;
  status: 'Available' | 'Delivering' | 'Offline';
  rating: number;
  earnings: number;
  distance: number;
};