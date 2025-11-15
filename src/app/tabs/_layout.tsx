import { Platform } from 'react-native';
import { Slot, Tabs } from 'expo-router';
import { Home, ShoppingCart, Archive, Settings, Building } from 'lucide-react-native';

export default function TabsLayout() {
  if (Platform.OS === 'android') {
    return <Slot />;
  }

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: '#6366F1',
        tabBarInactiveTintColor: '#9CA3AF',
        tabBarStyle: {
          backgroundColor: '#18181B',
          borderTopColor: '#27272A',
          borderTopWidth: 1,
          height: 60,
          paddingBottom: 8,
          paddingTop: 8,
        },
        headerShown: false,
        headerStyle: { backgroundColor: '#18181B' },
        headerTintColor: '#fff',
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Dashboard',
          tabBarIcon: ({ color, size }) => <Home color={color} size={size} />,
        }}
      />
      <Tabs.Screen
        name="sales"
        options={{
          title: 'Vendas',
          tabBarIcon: ({ color, size }) => (
            <ShoppingCart color={color} size={size} />
          ),
        }}
      />
      <Tabs.Screen
        name="inventory"
        options={{
          title: 'Estoque',
          tabBarIcon: ({ color, size }) => (
            <Archive color={color} size={size} />
          ),
        }}
      />
      <Tabs.Screen
        name="my-shops"
        options={{
          title: 'Lojas',
          tabBarIcon: ({ color, size }) => (
            <Building color={color} size={size} />
          ),
        }}
      />
      <Tabs.Screen
        name="DebugScreen"
        options={{
          title: 'Settings',
          tabBarIcon: ({ color, size }) => (
            <Settings color={color} size={size} />
          ),
        }}
      />
    </Tabs>
  );
}
