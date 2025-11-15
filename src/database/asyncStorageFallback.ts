/**
 * Fallback para quando SQLite falha no Android
 * Utiliza AsyncStorage como alternativa
 */

import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';

interface Product {
  id: string;
  name: string;
  stock: number;
  price: number;
  costPrice?: number;
  minQuantity: number;
  shopId: string;
}

interface Sale {
  id: string;
  product: string;
  itemsSold: number;
  total: number;
  shopId: string;
  date: string;
}

class AsyncStorageFallback {
  private static instance: AsyncStorageFallback;

  static getInstance(): AsyncStorageFallback {
    if (!AsyncStorageFallback.instance) {
      AsyncStorageFallback.instance = new AsyncStorageFallback();
    }
    return AsyncStorageFallback.instance;
  }

  // Produtos
  async getProducts(shopId: string): Promise<Product[]> {
    try {
      const data = await AsyncStorage.getItem(`products_${shopId}`);
      return data ? JSON.parse(data) : [];
    } catch (error) {
      console.error('Erro ao buscar produtos (AsyncStorage):', error);
      return [];
    }
  }

  async addProduct(product: Product): Promise<void> {
    try {
      const products = await this.getProducts(product.shopId);
      const newProduct = {
        ...product,
        id: Date.now().toString()
      };
      products.push(newProduct);
      await AsyncStorage.setItem(`products_${product.shopId}`, JSON.stringify(products));
    } catch (error) {
      console.error('Erro ao adicionar produto (AsyncStorage):', error);
    }
  }

  async updateProduct(shopId: string, productId: string, updates: Partial<Product>): Promise<void> {
    try {
      const products = await this.getProducts(shopId);
      const index = products.findIndex(p => p.id === productId);
      if (index >= 0) {
        products[index] = { ...products[index], ...updates };
        await AsyncStorage.setItem(`products_${shopId}`, JSON.stringify(products));
      }
    } catch (error) {
      console.error('Erro ao atualizar produto (AsyncStorage):', error);
    }
  }

  async deleteProduct(shopId: string, productId: string): Promise<void> {
    try {
      const products = await this.getProducts(shopId);
      const filtered = products.filter(p => p.id !== productId);
      await AsyncStorage.setItem(`products_${shopId}`, JSON.stringify(filtered));
    } catch (error) {
      console.error('Erro ao deletar produto (AsyncStorage):', error);
    }
  }

  // Vendas
  async getSales(shopId: string): Promise<Sale[]> {
    try {
      const data = await AsyncStorage.getItem(`sales_${shopId}`);
      return data ? JSON.parse(data) : [];
    } catch (error) {
      console.error('Erro ao buscar vendas (AsyncStorage):', error);
      return [];
    }
  }

  async addSale(sale: Sale): Promise<void> {
    try {
      const sales = await this.getSales(sale.shopId);
      const newSale = {
        ...sale,
        id: Date.now().toString()
      };
      sales.push(newSale);
      await AsyncStorage.setItem(`sales_${sale.shopId}`, JSON.stringify(sales));
    } catch (error) {
      console.error('Erro ao adicionar venda (AsyncStorage):', error);
    }
  }

  // Dados de exemplo
  async seedData(shopId: string): Promise<void> {
    try {
      console.log('🌱 Populando dados via AsyncStorage...');
      
      // Limpar dados existentes
      await AsyncStorage.removeItem(`products_${shopId}`);
      await AsyncStorage.removeItem(`sales_${shopId}`);
      
      // Produtos de exemplo
      const sampleProducts: Product[] = [
        { id: '1', name: 'Pão de Açúcar', stock: 50, price: 0.50, costPrice: 0.30, minQuantity: 10, shopId },
        { id: '2', name: 'Refrigerante 2L', stock: 30, price: 4.50, costPrice: 2.80, minQuantity: 5, shopId },
        { id: '3', name: 'Água Mineral', stock: 100, price: 1.50, costPrice: 0.80, minQuantity: 20, shopId },
        { id: '4', name: 'Biscoito Recheado', stock: 25, price: 2.80, costPrice: 1.50, minQuantity: 5, shopId },
        { id: '5', name: 'Leite Integral', stock: 40, price: 3.20, costPrice: 2.10, minQuantity: 8, shopId },
      ];

      await AsyncStorage.setItem(`products_${shopId}`, JSON.stringify(sampleProducts));

      // Vendas de exemplo
      const sampleSales: Sale[] = [
        { id: '1', date: '2025-11-15', product: 'Pão de Açúcar', itemsSold: 25, total: 12.50, shopId },
        { id: '2', date: '2025-11-15', product: 'Refrigerante 2L', itemsSold: 8, total: 36.00, shopId },
        { id: '3', date: '2025-11-14', product: 'Água Mineral', itemsSold: 15, total: 22.50, shopId },
        { id: '4', date: '2025-11-14', product: 'Biscoito Recheado', itemsSold: 12, total: 33.60, shopId },
        { id: '5', date: '2025-11-13', product: 'Leite Integral', itemsSold: 10, total: 32.00, shopId },
      ];

      await AsyncStorage.setItem(`sales_${shopId}`, JSON.stringify(sampleSales));
      
      console.log('✅ Dados de exemplo adicionados via AsyncStorage');
      
    } catch (error) {
      console.error('❌ Erro ao popular dados (AsyncStorage):', error);
    }
  }

  async clearData(shopId: string): Promise<void> {
    try {
      await AsyncStorage.removeItem(`products_${shopId}`);
      await AsyncStorage.removeItem(`sales_${shopId}`);
      console.log('✅ Dados limpos via AsyncStorage');
    } catch (error) {
      console.error('❌ Erro ao limpar dados (AsyncStorage):', error);
    }
  }
}

export const asyncStorageFallback = AsyncStorageFallback.getInstance();
export default AsyncStorageFallback;