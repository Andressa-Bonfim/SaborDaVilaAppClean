/**
 * Script para popular banco com dados de exemplo
 * Usado para testes e demonstração dos KPIs
 */

import { db } from './database';
import { getProductRepository } from './productRepository';

export const seedDatabase = async (shopId: string) => {
  try {
    console.log(`🌱 Populando banco com dados de exemplo para loja: ${shopId}`);

    // Limpar dados existentes primeiro para evitar duplicatas
    await clearSampleData(shopId);

    // Adicionar produtos de exemplo
    const productRepo = await getProductRepository();
    
    const sampleProducts = [
      { name: 'Pão de Açúcar', stock: 50, price: 0.50, costPrice: 0.30, minQuantity: 10, shopId },
      { name: 'Refrigerante 2L', stock: 30, price: 4.50, costPrice: 2.80, minQuantity: 5, shopId },
      { name: 'Água Mineral', stock: 100, price: 1.50, costPrice: 0.80, minQuantity: 20, shopId },
      { name: 'Biscoito Recheado', stock: 25, price: 2.80, costPrice: 1.50, minQuantity: 5, shopId },
      { name: 'Leite Integral', stock: 40, price: 3.20, costPrice: 2.10, minQuantity: 8, shopId },
      { name: 'Café 500g', stock: 15, price: 8.90, costPrice: 5.50, minQuantity: 3, shopId },
      { name: 'Açúcar Cristal 1kg', stock: 35, price: 2.99, costPrice: 1.80, minQuantity: 10, shopId },
      { name: 'Arroz 5kg', stock: 20, price: 12.50, costPrice: 8.20, minQuantity: 5, shopId },
    ];

    console.log('➕ Adicionando produtos de exemplo...');
    for (const product of sampleProducts) {
      console.log(`  - Inserindo: ${product.name}`);
      await productRepo.insert(product);
    }
    
    // Verificar se foi inserido
    const newProducts = await productRepo.getAll(shopId);
    console.log(`✅ Produtos inseridos: ${newProducts.length}`);

    // Adicionar vendas de exemplo dos últimos 30 dias
    await addSampleSales(shopId);
    
    console.log('✅ Dados de exemplo populados com sucesso!');
    
  } catch (error) {
    console.error('❌ Erro ao popular dados de exemplo:', error);
  }
};

const addSampleSales = async (shopId: string) => {
  try {
    console.log(`💰 Adicionando vendas de exemplo para loja: ${shopId}`);

    const salesData = [
      // Últimos 30 dias com vendas variadas
      { date: '2025-11-15', product: 'Pão de Açúcar', itemsSold: 25, total: 12.50 },
      { date: '2025-11-15', product: 'Refrigerante 2L', itemsSold: 8, total: 36.00 },
      { date: '2025-11-15', product: 'Água Mineral', itemsSold: 15, total: 22.50 },
      
      { date: '2025-11-14', product: 'Biscoito Recheado', itemsSold: 12, total: 33.60 },
      { date: '2025-11-14', product: 'Leite Integral', itemsSold: 10, total: 32.00 },
      { date: '2025-11-14', product: 'Pão de Açúcar', itemsSold: 30, total: 15.00 },
      
      { date: '2025-11-13', product: 'Café 500g', itemsSold: 5, total: 44.50 },
      { date: '2025-11-13', product: 'Açúcar Cristal 1kg', itemsSold: 8, total: 23.92 },
      { date: '2025-11-13', product: 'Água Mineral', itemsSold: 20, total: 30.00 },
      
      { date: '2025-11-12', product: 'Arroz 5kg', itemsSold: 6, total: 75.00 },
      { date: '2025-11-12', product: 'Refrigerante 2L', itemsSold: 12, total: 54.00 },
      { date: '2025-11-12', product: 'Pão de Açúcar', itemsSold: 40, total: 20.00 },
      
      { date: '2025-11-11', product: 'Biscoito Recheado', itemsSold: 15, total: 42.00 },
      { date: '2025-11-11', product: 'Leite Integral', itemsSold: 8, total: 25.60 },
      { date: '2025-11-11', product: 'Água Mineral', itemsSold: 25, total: 37.50 },
      
      // Semana passada
      { date: '2025-11-10', product: 'Café 500g', itemsSold: 3, total: 26.70 },
      { date: '2025-11-10', product: 'Açúcar Cristal 1kg', itemsSold: 10, total: 29.90 },
      { date: '2025-11-09', product: 'Arroz 5kg', itemsSold: 4, total: 50.00 },
      { date: '2025-11-09', product: 'Refrigerante 2L', itemsSold: 15, total: 67.50 },
      { date: '2025-11-08', product: 'Pão de Açúcar', itemsSold: 35, total: 17.50 },
      { date: '2025-11-08', product: 'Água Mineral', itemsSold: 18, total: 27.00 },
      { date: '2025-11-07', product: 'Biscoito Recheado', itemsSold: 20, total: 56.00 },
      { date: '2025-11-07', product: 'Leite Integral', itemsSold: 12, total: 38.40 },
      
      // Mês anterior
      { date: '2025-11-05', product: 'Café 500g', itemsSold: 7, total: 62.30 },
      { date: '2025-11-05', product: 'Açúcar Cristal 1kg', itemsSold: 6, total: 17.94 },
      { date: '2025-11-04', product: 'Arroz 5kg', itemsSold: 8, total: 100.00 },
      { date: '2025-11-04', product: 'Refrigerante 2L', itemsSold: 10, total: 45.00 },
      { date: '2025-11-03', product: 'Pão de Açúcar', itemsSold: 45, total: 22.50 },
      { date: '2025-11-03', product: 'Água Mineral', itemsSold: 22, total: 33.00 },
      { date: '2025-11-02', product: 'Biscoito Recheado', itemsSold: 18, total: 50.40 },
      { date: '2025-11-02', product: 'Leite Integral', itemsSold: 14, total: 44.80 },
      { date: '2025-11-01', product: 'Café 500g', itemsSold: 4, total: 35.60 },
      { date: '2025-11-01', product: 'Açúcar Cristal 1kg', itemsSold: 12, total: 35.88 },
    ];

    let insertedSales = 0;
    for (const sale of salesData) {
      try {
        db.runSync(
          'INSERT INTO sales (product, itemsSold, total, shopId, date) VALUES (?, ?, ?, ?, ?)',
          [sale.product, sale.itemsSold, sale.total, shopId, sale.date]
        );
        insertedSales++;
      } catch (error) {
        console.error(`❌ Erro ao inserir venda ${sale.product}:`, error);
      }
    }

    console.log(`✅ ${insertedSales} vendas de exemplo adicionadas`);
    
  } catch (error) {
    console.error('❌ Erro ao adicionar vendas de exemplo:', error);
  }
};

export const clearSampleData = async (shopId: string) => {
  try {
    console.log('🧹 Limpando dados de exemplo...');
    
    // Remover vendas
    db.runSync('DELETE FROM sales WHERE shopId = ?', [shopId]);
    
    // Remover produtos
    db.runSync('DELETE FROM products WHERE shopId = ?', [shopId]);
    
    console.log('✅ Dados de exemplo removidos');
    
  } catch (error) {
    console.error('❌ Erro ao limpar dados de exemplo:', error);
  }
};