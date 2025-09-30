// apps/web/src/data/mockData.ts
import { Category, MenuItem } from '../types'

export const categories: Category[] = [
  { icon: '🍔', name: 'Burgers' },
  { icon: '🍕', name: 'Pizza' },
  { icon: '🍣', name: 'Sushi' },
  { icon: '🥗', name: 'Salads' },
  { icon: '🍰', name: 'Desserts' },
  { icon: '🥤', name: 'Beverages' },
]

export const dietaryPreferences: string[] = [
  'Vegetarian',
  'Vegan',
  'Gluten Free',
  'Pescatarian',
  'Healthy',
]

export const menuItems: MenuItem[] = [
  {
    name: 'Classic Cheeseburger',
    price: 12.99,
    description: 'Juicy beef patty, Cheddar cheese, lettuce, tomato, and our special sauce',
    rating: 4.8,
    time: '15-20 min',
    calories: 580,
    image: '/assets/cheeseburger.jpg',
    tags: ['Gluten Free Option'],
    isPopular: true,
  },
  {
    name: 'Margherita Pizza',
    price: 14.99,
    description: 'Fresh mozzarella, basil, and tomato sauce on thin crust',
    rating: 4.7,
    time: '10-15 min',
    calories: 320,
    image: '/assets/pizza.jpg',
    tags: ['Vegetarian', 'Gluten Free Option'],
  },
  {
    name: 'Salmon Avocado Roll',
    price: 16.99,
    description: 'Fresh salmon, avocado, cucumber wrapped in nori with sushi rice',
    rating: 4.9,
    time: '10-15 min',
    calories: 250,
    image: '/assets/sushi.jpg',
    tags: ['Pescatarian', 'Gluten Free'],
  },
  {
    name: 'Mediterranean Salad',
    price: 10.99,
    description: 'Mixed greens, feta cheese, olives, tomatoes, and balsamic vinaigrette',
    rating: 4.6,
    time: '5-10 min',
    calories: 180,
    image: '/assets/salad.jpg',
    tags: ['Vegetarian', 'Healthy'],
  },
  {
    name: 'Chocolate Lava Cake',
    price: 8.99,
    description: 'Warm chocolate cake with molten center, served with vanilla ice cream',
    rating: 4.8,
    time: '8-12 min',
    calories: 450,
    image: '/assets/cake.jpg',
    tags: ['Vegetarian'],
  },
  // Add more items as needed
]