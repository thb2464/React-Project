import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { BottomTabNavigationProp } from '@react-navigation/bottom-tabs';
import { NavigatorScreenParams } from '@react-navigation/native';

// --- Root Stack (the screens INSIDE the Home tab) ---
export type RootStackParamList = {
  Home: undefined;
  Menu: undefined;
  Checkout: undefined;
  Support: undefined;
  RestaurantDashboard: undefined;
};

// --- Bottom Tabs (the main app tabs) ---
export type RootTabParamList = {
  // This tells the tab navigator that 'HomeTab' nests the 'RootStackParamList'
  HomeTab: NavigatorScreenParams<RootStackParamList>;
  OrdersTab: undefined;
  ProfileTab: undefined;
};

// --- Screen-specific Prop Types ---
export type HomeScreenNavigationProp = NativeStackNavigationProp<
  RootStackParamList,
  'Home'
>;

export type MenuScreenNavigationProp = NativeStackNavigationProp<
  RootStackParamList,
  'Menu'
>;

// This is the new type for ProfileScreen's navigation
export type ProfileScreenNavigationProp = BottomTabNavigationProp<
  RootTabParamList,
  'ProfileTab'
>;