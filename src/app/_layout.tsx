import { Tabs } from 'expo-router';
import { Home, ShoppingCart, Archive } from 'lucide-react-native';

export default function Layout() {
  return (
    <Tabs
      screenOptions={{
        // cores ativas e inativas
        tabBarActiveTintColor: '#6366F1',
        tabBarInactiveTintColor: '#9CA3AF',

        // estilo da barra inferior
        tabBarStyle: {
          backgroundColor: '#18181B',
          borderTopColor: '#27272A',
          borderTopWidth: 1,
          height: 60,
          paddingBottom: 8,
          paddingTop: 8,
        },

        // oculta cabeçalho padrão do stack
        headerShown: false,
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
          tabBarIcon: ({ color, size }) => <ShoppingCart color={color} size={size} />,
        }}
      />
      <Tabs.Screen
        name="inventory"
        options={{
          title: 'Estoque',
          tabBarIcon: ({ color, size }) => <Archive color={color} size={size} />,
        }}
      />
    </Tabs>
  );
}
