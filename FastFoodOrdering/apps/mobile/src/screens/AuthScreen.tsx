import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
} from 'react-native';
import { useAuth } from '@fastfoodordering/hooks';
import Ionicons from '@expo/vector-icons/Ionicons';

export default function AuthScreen() {
  // 1. Get the login function from our new hook
  const { login } = useAuth();

  return (
    <View style={styles.container}>
      <Ionicons name="fast-food-outline" size={80} color="#000" />
      <Text style={styles.title}>Welcome!</Text>
      
      <TextInput
        style={styles.input}
        placeholder="Email"
        keyboardType="email-address"
        autoCapitalize="none"
      />
      <TextInput
        style={styles.input}
        placeholder="Password"
        secureTextEntry
      />
      
      <TouchableOpacity style={styles.loginButton} onPress={login}>
        <Text style={styles.loginButtonText}>Login</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
    backgroundColor: '#fff',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    marginVertical: 24,
  },
  input: {
    width: '100%',
    height: 50,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    paddingHorizontal: 16,
    fontSize: 16,
    marginBottom: 12,
  },
  loginButton: {
    width: '100%',
    backgroundColor: '#000',
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 16,
  },
  loginButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
});