// src/app/_layout.tsx
import { Drawer } from 'expo-router/drawer';
import { MaterialIcons } from '@expo/vector-icons';

export default function RootLayout() {
  return (
    <Drawer
      screenOptions={{
        headerStyle: { backgroundColor: '#18181B' },
        headerTintColor: '#fff',
        drawerStyle: { backgroundColor: '#18181B' },
        drawerActiveTintColor: '#6366F1',
        drawerInactiveTintColor: '#9CA3AF',
      }}
    >
      <Drawer.Screen
        name="tabs"
        options={{
          title: 'Painel Principal',
          drawerIcon: ({ color, size }) => (
            <MaterialIcons name="dashboard" color={color} size={size} />
          ),
        }}
      />
      <Drawer.Screen
        name="sales"
        options={{
          title: 'Vendas',
          drawerIcon: ({ color, size }) => (
            <MaterialIcons name="shopping-cart" color={color} size={size} />
          ),
        }}
      />
      <Drawer.Screen
        name="inventory"
        options={{
          title: 'Estoque',
          drawerIcon: ({ color, size }) => (
            <MaterialIcons name="inventory" color={color} size={size} />
          ),
        }}
      />
    </Drawer>
  );
}
