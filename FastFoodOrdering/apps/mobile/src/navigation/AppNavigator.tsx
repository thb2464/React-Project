import React from 'react';
import { View } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import Ionicons from '@expo/vector-icons/Ionicons';

import { useAppState } from '@fastfoodordering/store';
import { useCurrentOrder } from '@fastfoodordering/hooks'; 
import { RootStackParamList, RootTabParamList } from './types';

// Screens
import HomePage from '../screens/HomePage';
import MenuScreen from '../screens/MenuScreen';
import OrdersScreen from '../screens/OrdersScreen';
import ProfileScreen from '../screens/ProfileScreen';
import CheckoutScreen from '../screens/CheckoutScreen';
import SupportScreen from '../screens/SupportScreen';
import AuthScreen from '../screens/AuthScreen';

const Stack = createNativeStackNavigator<RootStackParamList>();
const CustomerTab = createBottomTabNavigator<RootTabParamList>();

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

function CustomerTabs() {
  const { currentOrder } = useCurrentOrder();
  const isDelivering = currentOrder?.status === 'out_for_delivery';

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

          return (
            <View style={{ alignItems: 'center', justifyContent: 'center', width: 30 }}>
              <Ionicons name={iconName} size={size} color={color} />
              
              {/* RED DOT: Top Right Position */}
              {route.name === 'OrdersTab' && isDelivering && (
                <View style={{
                  position: 'absolute',
                  top: -2,    // Shift Up
                  right: -2,  // Shift Right
                  width: 8,   // Slightly larger for visibility
                  height: 8,
                  borderRadius: 4,
                  backgroundColor: '#FF3B30',
                  borderWidth: 1, // Optional white border to separate from icon
                  borderColor: '#fff'
                }} />
              )}
            </View>
          );
        },
        tabBarActiveTintColor: '#000000',
        tabBarInactiveTintColor: 'gray',
      })}
    >
      <CustomerTab.Screen
        name="HomeTab"
        component={HomeStack}
        options={{ title: 'Trang chủ' }}
      />
      <CustomerTab.Screen
        name="OrdersTab"
        component={OrdersScreen}
        options={{ title: 'Đơn hàng' }}
      />
      <CustomerTab.Screen
        name="ProfileTab"
        component={ProfileScreen}
        options={{ title: 'Tài khoản' }}
      />
    </CustomerTab.Navigator>
  );
}

function RootNavigator() {
  const { user } = useAppState();
  if (!user) return <AuthScreen />;
  return <CustomerTabs />;
}

export default function AppNavigator() {
  return (
    <NavigationContainer>
      <RootNavigator />
    </NavigationContainer>
  );
}