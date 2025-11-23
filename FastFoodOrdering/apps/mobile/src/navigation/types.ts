import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { BottomTabNavigationProp } from '@react-navigation/bottom-tabs';
import { NavigatorScreenParams } from '@react-navigation/native';

// --- STACK 1: Customer Home Stack ---
export type RootStackParamList = {
  Home: undefined;
  Menu: undefined;
  Checkout: undefined;
  Support: undefined;
};

// --- TABS 1: Customer Bottom Tabs ---
export type RootTabParamList = {
  HomeTab: NavigatorScreenParams<RootStackParamList>;
  OrdersTab: undefined;
  ProfileTab: undefined;
};

// --- Screen Prop Types ---
export type HomeScreenNavigationProp = NativeStackNavigationProp<
  RootStackParamList,
  'Home'
>;

export type MenuScreenNavigationProp = NativeStackNavigationProp<
  RootStackParamList,
  'Menu'
>;

export type ProfileScreenNavigationProp = BottomTabNavigationProp<
  RootTabParamList,
  'ProfileTab'
>;

