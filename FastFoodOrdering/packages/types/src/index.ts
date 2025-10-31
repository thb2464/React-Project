// apps/web/src/types/index.ts
export interface Category {
  icon: string
  name: string
}

export interface MenuItemType {
  id: string
  name: string
  description: string
  originalPrice: number
  discountedPrice: number
  image: string
  veg: boolean
  customizationConfig?: CustomizationGroup[]
  tags: string[]
  isPopular?: boolean
  rating: number
  time: string
  calories: number
}

export interface MenuCategoryType {
  id: string
  name: string
  description: string
  items: MenuItemType[]
}

export interface CustomizationGroup {
  id: string
  title: string
  required: boolean
  type: 'radio' | 'checkbox'
  defaultOptionId?: string
  options: CustomizationOption[]
}

export interface CustomizationOption {
  id: string
  name: string
  price: number
  ingredients?: string
  image?: string
}

export type OrderItem = {
  name: string;
  price: number;
};

export type Order = {
  id: string;
  date: string;
  status: 'Confirmed' | 'Preparing' | 'Ready' | 'Out for Delivery' | 'Delivered';
  droneName: string; // Added drone name
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