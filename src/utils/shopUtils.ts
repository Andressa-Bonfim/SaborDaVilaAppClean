import AsyncStorage from '@react-native-async-storage/async-storage';

// Função para obter o shopId ativo atualmente
export async function getActiveShopId(): Promise<string | null> {
  try {
    const shopData = await AsyncStorage.getItem('activeShop');
    if (shopData) {
      const shop = JSON.parse(shopData);
      return shop.id;
    }
    return null;
  } catch (error) {
    console.error('❌ Erro ao obter shopId ativo:', error);
    return null;
  }
}