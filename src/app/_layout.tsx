// src/app/_layout.tsx
import React from 'react';
import { Platform } from 'react-native';
import { Slot, Stack } from 'expo-router';
import { Drawer } from 'expo-router/drawer';
import { DrawerContentScrollView, DrawerItem } from '@react-navigation/drawer';
import { Text, TouchableOpacity, View, Alert } from 'react-native';
import { AuthProvider, useAuth } from '../context/AuthContext';
import { AndroidDiagnostic } from '../components/AndroidDiagnostic';
import { Home, BarChart3, ShoppingCart, Archive, Building, Settings, LogOut, MapPin, Menu, Bug } from 'lucide-react-native';

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
          <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 4 }}>
            <MapPin size={14} color="#9CA3AF" />
            <Text style={{ color: '#9CA3AF', fontSize: 14, marginLeft: 6 }}>
              {activeShop.nomeDaLoja}
            </Text>
          </View>
        )}
      </View>

      {/* Menu Items */}
      <View style={{ flexDirection: 'row', alignItems: 'center', padding: 16 }}>
        <Menu size={18} color="#fff" />
        <Text style={{ color: '#fff', marginLeft: 8, fontWeight: '700', fontSize: 16 }}>Menu Principal</Text>
      </View>
      
      <DrawerItem
        label="Home"
        labelStyle={{ color: '#fff', fontSize: 16, fontWeight: '500' }}
        icon={({ color, size }) => <Home color={color} size={size} />}
        onPress={() => props.navigation.navigate('tabs', { screen: 'index' })}
        style={{ marginVertical: 2 }}
      />
      
      <DrawerItem
        label="Dashboard"
        labelStyle={{ color: '#fff', fontSize: 16, fontWeight: '500' }}
        icon={({ color, size }) => <BarChart3 color={color} size={size} />}
        onPress={() => props.navigation.navigate('tabs', { screen: 'dashboard' })}
        style={{ marginVertical: 2 }}
      />
      
      <DrawerItem
        label="Vendas"
        labelStyle={{ color: '#fff', fontSize: 16, fontWeight: '500' }}
        icon={({ color, size }) => <ShoppingCart color={color} size={size} />}
        onPress={() => props.navigation.navigate('tabs', { screen: 'sales' })}
        style={{ marginVertical: 2 }}
      />
      
      <DrawerItem
        label="Estoque"
        labelStyle={{ color: '#fff', fontSize: 16, fontWeight: '500' }}
        icon={({ color, size }) => <Archive color={color} size={size} />}
        onPress={() => props.navigation.navigate('tabs', { screen: 'inventory' })}
        style={{ marginVertical: 2 }}
      />
      
      <DrawerItem
        label="Minhas Lojas"
        labelStyle={{ color: '#fff', fontSize: 16, fontWeight: '500' }}
        icon={({ color, size }) => <Building color={color} size={size} />}
        onPress={() => props.navigation.navigate('tabs', { screen: 'my-shops' })}
        style={{ marginVertical: 2 }}
      />
      
      <DrawerItem
        label="Configurações"
        labelStyle={{ color: '#fff', fontSize: 16, fontWeight: '500' }}
        icon={({ color, size }) => <Settings color={color} size={size} />}
        onPress={() => props.navigation.navigate('tabs', { screen: 'DebugScreen' })}
        style={{ marginVertical: 2 }}
      />

      {/* Logout */}
      <View style={{ flex: 1, justifyContent: 'flex-end', padding: 16 }}>
        <TouchableOpacity
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            padding: 16,
            backgroundColor: '#DC2626',
            borderRadius: 12,
            marginTop: 20
          }}
          onPress={handleLogout}
        >
          <LogOut size={22} color="#fff" />
          <Text style={{ color: '#fff', marginLeft: 12, fontWeight: '600', fontSize: 16 }}>Sair da Conta</Text>
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
        <Stack.Screen name="index" />
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
      {Platform.OS === 'android' && <AndroidDiagnostic />}
    </AuthProvider>
  );
}
