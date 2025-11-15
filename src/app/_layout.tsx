// src/app/_layout.tsx
import React from 'react';
import { Platform } from 'react-native';
import { Slot, Stack } from 'expo-router';
import { Drawer } from 'expo-router/drawer';
import { MaterialIcons } from '@expo/vector-icons';
import { DrawerContentScrollView, DrawerItem } from '@react-navigation/drawer';
import { Text, TouchableOpacity, View, Alert } from 'react-native';
import { AuthProvider, useAuth } from '../context/AuthContext';

function CustomDrawerContent(props: any) {
  const { logout, user, activeShop } = useAuth();

  const handleLogout = () => {
    Alert.alert(
      'Sair',
      'Tem certeza que deseja sair?',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Sair',
          style: 'destructive',
          onPress: logout
        }
      ]
    );
  };

  return (
    <DrawerContentScrollView {...props} contentContainerStyle={{ backgroundColor: '#18181B', flex: 1 }}>
      {/* User Info */}
      <View style={{ padding: 16, borderBottomWidth: 1, borderBottomColor: '#333' }}>
        <Text style={{ color: '#fff', fontSize: 16, fontWeight: '700' }}>
          {user?.nomeCompleto}
        </Text>
        {activeShop && (
          <Text style={{ color: '#9CA3AF', fontSize: 14, marginTop: 4 }}>
            📍 {activeShop.nomeDaLoja}
          </Text>
        )}
      </View>

      {/* Menu Items */}
      <Text style={{ color: '#fff', padding: 16, fontWeight: '700' }}>Menu</Text>
      <DrawerItem
        label="Painel Principal"
        labelStyle={{ color: '#fff' }}
        icon={({ color, size }) => <MaterialIcons name="dashboard" color={color} size={size} />}
        onPress={() => props.navigation.navigate('tabs', { screen: 'index' })}
      />
      <DrawerItem
        label="Minhas Lojas"
        labelStyle={{ color: '#fff' }}
        icon={({ color, size }) => <MaterialIcons name="store" color={color} size={size} />}
        onPress={() => props.navigation.navigate('tabs', { screen: 'my-shops' })}
      />
      <DrawerItem
        label="Vendas"
        labelStyle={{ color: '#fff' }}
        icon={({ color, size }) => <MaterialIcons name="shopping-cart" color={color} size={size} />}
        onPress={() => props.navigation.navigate('tabs', { screen: 'sales' })}
      />
      <DrawerItem
        label="Estoque"
        labelStyle={{ color: '#fff' }}
        icon={({ color, size }) => <MaterialIcons name="inventory" color={color} size={size} />}
        onPress={() => props.navigation.navigate('tabs', { screen: 'inventory' })}
      />
      <DrawerItem
        label="Settings"
        labelStyle={{ color: '#fff' }}
        icon={({ color, size }) => <MaterialIcons name="bug-report" color={color} size={size} />}
        onPress={() => props.navigation.navigate('tabs', { screen: 'DebugScreen' })}
      />

      {/* Logout */}
      <View style={{ flex: 1, justifyContent: 'flex-end', padding: 16 }}>
        <TouchableOpacity
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            padding: 12,
            backgroundColor: '#DC2626',
            borderRadius: 8
          }}
          onPress={handleLogout}
        >
          <MaterialIcons name="logout" size={20} color="#fff" />
          <Text style={{ color: '#fff', marginLeft: 8, fontWeight: '600' }}>Sair</Text>
        </TouchableOpacity>
      </View>
    </DrawerContentScrollView>
  );
}

function NavigationLayout() {
  const { isAuthenticated, isLoading } = useAuth();

  // Mostrar loading enquanto verifica autenticação
  if (isLoading) {
    return <Slot />; // Ou um componente de loading
  }

  // Se não autenticado, mostrar telas de auth
  if (!isAuthenticated) {
    return (
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="login" />
        <Stack.Screen name="register" />
        <Stack.Screen name="create-first-shop" />
      </Stack>
    );
  }

  // Se autenticado, mostrar navegação baseada na plataforma
  // iOS: usa as tabs inferiores definidas em src/app/tabs/_layout.tsx
  if (Platform.OS !== 'android') {
    return <Slot />;
  }

  // Android: mostra Drawer (menu hambúrguer) com a tela de Tabs dentro
  return (
    <Drawer
      initialRouteName="tabs"
      drawerContent={(props) => <CustomDrawerContent {...props} />}
      screenOptions={{
        // escondemos o header nativo porque usamos Header custom nas telas
        headerShown: false,
        headerStyle: { backgroundColor: '#18181B' },
        headerTintColor: '#fff',
        drawerStyle: { backgroundColor: '#18181B' },
        drawerActiveTintColor: '#6366F1',
        drawerInactiveTintColor: '#9CA3AF',
      }}
    >
      {/* Only tabs screen is needed for proper navigation */}
      <Drawer.Screen name="tabs" />
    </Drawer>
  );
}

export default function RootLayout() {
  return (
    <AuthProvider>
      <NavigationLayout />
    </AuthProvider>
  );
}
