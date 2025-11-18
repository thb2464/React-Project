import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import Ionicons from '@expo/vector-icons/Ionicons';

import { useAppState } from '@fastfoodordering/store';
import { RootStackParamList, RootTabParamList } from './types';

// --- Import Screens ---
import HomePage from '../screens/HomePage';
import MenuScreen from '../screens/MenuScreen';
import OrdersScreen from '../screens/OrdersScreen';
import ProfileScreen from '../screens/ProfileScreen';
import CheckoutScreen from '../screens/CheckoutScreen';
import SupportScreen from '../screens/SupportScreen';
import AuthScreen from '../screens/AuthScreen';

// --- Create Navigators ---
const Stack = createNativeStackNavigator<RootStackParamList>();
const CustomerTab = createBottomTabNavigator<RootTabParamList>();

// --- STACK: Customer Home ---
function HomeStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="Home" component={HomePage} />
      <Stack.Screen name="Menu" component={MenuScreen} />
      <Stack.Screen name="Checkout" component={CheckoutScreen} />
      <Stack.Screen name="Support" component={SupportScreen} />
    </Stack.Navigator>
  );
}

// --- TABS: Customer App ---
function CustomerTabs() {
  return (
    <CustomerTab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarIcon: ({ focused, color, size }) => {
          let iconName: React.ComponentProps<typeof Ionicons>['name'] = 'alert';
          if (route.name === 'HomeTab') {
            iconName = focused ? 'home' : 'home-outline';
          } else if (route.name === 'OrdersTab') {
            iconName = focused ? 'receipt' : 'receipt-outline';
          } else if (route.name === 'ProfileTab') {
            iconName = focused ? 'person' : 'person-outline';
          }
          return <Ionicons name={iconName} size={size} color={color} />;
        },
        tabBarActiveTintColor: '#000000',
        tabBarInactiveTintColor: 'gray',
      })}
    >
      <CustomerTab.Screen
        name="HomeTab"
        component={HomeStack}
        options={{ title: 'Home' }}
      />
      <CustomerTab.Screen
        name="OrdersTab"
        component={OrdersScreen}
        options={{ title: 'My Orders' }}
      />
      <CustomerTab.Screen
        name="ProfileTab"
        component={ProfileScreen}
        options={{ title: 'Profile' }}
      />
    </CustomerTab.Navigator>
  );
}

// --- ROOT: Decides which app to show ---
function RootNavigator() {
  const { user } = useAppState();

  if (!user) {
    return <AuthScreen />;
  }
  
  return <CustomerTabs />;
}

// --- Main export ---
export default function AppNavigator() {
  return (
    <NavigationContainer>
      <RootNavigator />
    </NavigationContainer>
  );
}