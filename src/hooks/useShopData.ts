import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { getRecentSales, getDailySales, getWeeklySummary } from '../database/salesRepository';
import { getProductRepository, getAllProducts } from '../database/productRepository';
import { DailySales, SalesSummary } from '../types/sales';

interface ShopData {
  // Sales data
  recentSales: any[];
  dailySales: DailySales;
  weeklySummary: SalesSummary;
  
  // Products data
  products: any[];
  lowStockProducts: any[];
  
  // Loading states
  isLoading: boolean;
  lastUpdated: Date | null;
}

export function useShopData() {
  const { activeShop, isAuthenticated } = useAuth();
  const [shopData, setShopData] = useState<ShopData>({
    recentSales: [],
    dailySales: { total: 0, items: 0 },
    weeklySummary: { total: 0, items: 0, avgTicket: 0 },
    products: [],
    lowStockProducts: [],
    isLoading: false,
    lastUpdated: null,
  });

  // Carregar dados da loja ativa
  const loadShopData = async (shopId?: string) => {
    if (!isAuthenticated || !activeShop) return;

    const currentShopId = shopId || activeShop.id;
    
    try {
      setShopData(prev => ({ ...prev, isLoading: true }));

      // Carregar dados em paralelo
      const [recentSales, dailySales, weeklySummary, products] = await Promise.all([
        getRecentSales(currentShopId),
        getDailySales(currentShopId), 
        getWeeklySummary(currentShopId),
        loadProducts(currentShopId)
      ]);

      // Filtrar produtos com estoque baixo
      const lowStockProducts = products.filter((product: any) => 
        product.quantity <= product.minQuantity
      );

      setShopData({
        recentSales,
        dailySales,
        weeklySummary,
        products,
        lowStockProducts,
        isLoading: false,
        lastUpdated: new Date(),
      });

      console.log(`📊 Dados carregados para a loja: ${activeShop.nomeDaLoja}`);
      
    } catch (error) {
      console.error('❌ Erro ao carregar dados da loja:', error);
      setShopData(prev => ({ ...prev, isLoading: false }));
    }
  };

  // Função auxiliar para carregar produtos
  const loadProducts = async (shopId: string) => {
    try {
      const productRepo = await getProductRepository();
      return await productRepo.getAll(shopId);
    } catch (error) {
      console.error('❌ Erro ao carregar produtos:', error);
      // Fallback para função legacy se der erro
      return getAllProducts().filter((product: any) => product.shopId === shopId);
    }
  };

  // Recarregar dados quando a loja ativa mudar
  useEffect(() => {
    if (activeShop) {
      loadShopData();
    } else {
      // Limpar dados se não há loja ativa
      setShopData({
        recentSales: [],
        dailySales: { total: 0, items: 0 },
        weeklySummary: { total: 0, items: 0, avgTicket: 0 },
        products: [],
        lowStockProducts: [],
        isLoading: false,
        lastUpdated: null,
      });
    }
  }, [activeShop?.id, isAuthenticated]);

  // Função para refresh manual
  const refreshData = async () => {
    if (activeShop) {
      await loadShopData();
    }
  };

  // Função para invalidar dados específicos
  const invalidateData = (dataType?: 'sales' | 'products' | 'all') => {
    if (activeShop) {
      loadShopData();
    }
  };

  return {
    ...shopData,
    refreshData,
    invalidateData,
    shopId: activeShop?.id || null,
    shopName: activeShop?.nomeDaLoja || null,
  };
}