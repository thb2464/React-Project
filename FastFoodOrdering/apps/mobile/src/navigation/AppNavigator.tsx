import React from 'react';
import Ionicons from '@expo/vector-icons/Ionicons'; //Icons for mobile
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { AuthProvider, useAuth } from '@fastfoodordering/hooks';
import { RootStackParamList, RootTabParamList } from './types';

// Import all screens
import HomePage from '../screens/HomePage';
import MenuScreen from '../screens/MenuScreen';
import OrdersScreen from '../screens/OrdersScreen';
import ProfileScreen from '../screens/ProfileScreen';
import CheckoutScreen from '../screens/CheckoutScreen';
import SupportScreen from '../screens/SupportScreen';
import AuthScreen from '../screens/AuthScreen';
import RestaurantDashboardScreen from '../screens/RestaurantDashboardScreen';

// --- Create Navigators ---
const Stack = createNativeStackNavigator<RootStackParamList>();
const Tab = createBottomTabNavigator<RootTabParamList>();

/**
 * This is the stack for the "Home" tab.
 * It contains the Home screen and the Menu screen.
 */
function HomeStack() {
  return (
    <Stack.Navigator>
      <Stack.Screen
        name="Home"
        component={HomePage}
        options={{ title: 'Welcome' }}
      />
      <Stack.Screen
        name="Menu"
        component={MenuScreen}
        options={{ title: 'Our Menu' }}
      />
      <Stack.Screen
        name="Checkout"
        component={CheckoutScreen}
        options={{ title: 'Checkout' }}
      />
      <Stack.Screen
        name="Support"
        component={SupportScreen}
        options={{ title: 'Support' }}
      />
      <Stack.Screen
        name="RestaurantDashboard"
        component={RestaurantDashboardScreen}
        options={{ title: 'Admin Dashboard' }}
      />

    </Stack.Navigator>
  );
}

/**
 * This is the main Bottom Tab Navigator for the app.
 */
function AppTabs() {
  return (
    <Tab.Navigator
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
        tabBarActiveTintColor: '#000000', // Set active icon color
        tabBarInactiveTintColor: 'gray', // Set inactive icon color
      })}
    >
      <Tab.Screen
        name="HomeTab"
        component={HomeStack}
        options={{ title: 'Home' }}
      />
      <Tab.Screen
        name="OrdersTab"
        component={OrdersScreen}
        options={{ title: 'My Orders' }}
      />
      <Tab.Screen
        name="ProfileTab"
        component={ProfileScreen}
        options={{ title: 'Profile' }}
      />
    </Tab.Navigator>
  );
}

function RootNavigator() {
  const { isLoggedIn } = useAuth();
  return isLoggedIn ? <AppTabs /> : <AuthScreen />;
}

export default function AppNavigator() {
  return (
    // 1. The AuthProvider wraps everything that needs auth
    <AuthProvider>
      {/* 2. The NavigationContainer wraps the navigator */}
      <NavigationContainer>
        {/* 3. RootNavigator now decides which screen to show */}
        <RootNavigator />
      </NavigationContainer>
    </AuthProvider>
  );
}