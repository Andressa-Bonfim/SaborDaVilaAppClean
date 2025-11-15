/**
 * DashboardService - Serviço para métricas e KPIs do dashboard
 * Implementa Clean Code e SOLID principles
 * Todas as consultas são filtradas por shopId
 */

import { db } from '../database/database';
import { getProductRepository } from '../database/productRepository';

// Types para tipagem estrita
export interface DailySalesKPI {
  totalSales: number;
  itemsSold: number;
  salesCount: number;
}

export interface WeeklySalesKPI {
  totalSales: number;
  itemsSold: number;
  salesCount: number;
}

export interface MonthlySalesKPI {
  totalSales: number;
  itemsSold: number;
  salesCount: number;
}

export interface StockMetrics {
  totalProducts: number;
  totalStockItems: number;
  totalStockValue: number;
  lowStockProducts: LowStockProduct[];
  lowStockCount: number;
}

export interface LowStockProduct {
  id: number;
  name: string;
  currentStock: number;
  minQuantity: number;
}

export interface TopProduct {
  id: number;
  name: string;
  totalSold: number;
  revenue: number;
}

export interface SalesDataPoint {
  date: string;
  sales: number;
}

export interface DashboardMetrics {
  daily: DailySalesKPI;
  weekly: WeeklySalesKPI;
  monthly: MonthlySalesKPI;
  averageTicket: number;
  stockMetrics: StockMetrics;
  topProducts: TopProduct[];
  salesLast30Days: SalesDataPoint[];
}

/**
 * Calcula as vendas do dia atual
 */
export const getDailySales = async (shopId: string): Promise<DailySalesKPI> => {
  console.log(`📊 DashboardService: Calculando vendas do dia - Loja ${shopId}`);
  
  try {
    const today = new Date().toISOString().split('T')[0]; // YYYY-MM-DD
    
    const result = await db.getAllAsync(`
      SELECT 
        COALESCE(SUM(total), 0) as totalSales,
        COALESCE(SUM(itemsSold), 0) as itemsSold,
        COUNT(*) as salesCount
      FROM sales 
      WHERE shopId = ? 
        AND DATE(date) = ?
    `, [shopId, today]);

    const data = result[0] as any;
    
    console.log(`✅ DashboardService: Vendas do dia calculadas - R$ ${data.totalSales}`);
    
    return {
      totalSales: data.totalSales || 0,
      itemsSold: data.itemsSold || 0,
      salesCount: data.salesCount || 0,
    };
  } catch (error) {
    console.error('❌ DashboardService: Erro ao calcular vendas do dia:', error);
    return { totalSales: 0, itemsSold: 0, salesCount: 0 };
  }
};

/**
 * Calcula as vendas dos últimos 7 dias
 */
export const getWeeklySales = async (shopId: string): Promise<WeeklySalesKPI> => {
  console.log(`📊 DashboardService: Calculando vendas da semana - Loja ${shopId}`);
  
  try {
    const result = await db.getAllAsync(`
      SELECT 
        COALESCE(SUM(total), 0) as totalSales,
        COALESCE(SUM(itemsSold), 0) as itemsSold,
        COUNT(*) as salesCount
      FROM sales 
      WHERE shopId = ? 
        AND DATE(date) >= DATE('now', '-7 days')
    `, [shopId]);

    const data = result[0] as any;
    
    console.log(`✅ DashboardService: Vendas da semana calculadas - R$ ${data.totalSales}`);
    
    return {
      totalSales: data.totalSales || 0,
      itemsSold: data.itemsSold || 0,
      salesCount: data.salesCount || 0,
    };
  } catch (error) {
    console.error('❌ DashboardService: Erro ao calcular vendas da semana:', error);
    return { totalSales: 0, itemsSold: 0, salesCount: 0 };
  }
};

/**
 * Calcula as vendas do mês atual
 */
export const getMonthlySales = async (shopId: string): Promise<MonthlySalesKPI> => {
  console.log(`📊 DashboardService: Calculando vendas do mês - Loja ${shopId}`);
  
  try {
    const result = await db.getAllAsync(`
      SELECT 
        COALESCE(SUM(total), 0) as totalSales,
        COALESCE(SUM(itemsSold), 0) as itemsSold,
        COUNT(*) as salesCount
      FROM sales 
      WHERE shopId = ? 
        AND strftime('%Y-%m', date) = strftime('%Y-%m', 'now')
    `, [shopId]);

    const data = result[0] as any;
    
    console.log(`✅ DashboardService: Vendas do mês calculadas - R$ ${data.totalSales}`);
    
    return {
      totalSales: data.totalSales || 0,
      itemsSold: data.itemsSold || 0,
      salesCount: data.salesCount || 0,
    };
  } catch (error) {
    console.error('❌ DashboardService: Erro ao calcular vendas do mês:', error);
    return { totalSales: 0, itemsSold: 0, salesCount: 0 };
  }
};

/**
 * Calcula o ticket médio baseado nas vendas do período
 */
export const getAverageTicket = async (shopId: string, days: number = 30): Promise<number> => {
  console.log(`📊 DashboardService: Calculando ticket médio - Loja ${shopId}`);
  
  try {
    const result = await db.getAllAsync(`
      SELECT 
        COALESCE(AVG(total), 0) as averageTicket
      FROM sales 
      WHERE shopId = ? 
        AND DATE(date) >= DATE('now', '-${days} days')
        AND total > 0
    `, [shopId]);

    const data = result[0] as any;
    const averageTicket = data.averageTicket || 0;
    
    console.log(`✅ DashboardService: Ticket médio calculado - R$ ${averageTicket}`);
    
    return averageTicket;
  } catch (error) {
    console.error('❌ DashboardService: Erro ao calcular ticket médio:', error);
    return 0;
  }
};

/**
 * Calcula métricas do estoque
 */
export const getStockMetrics = async (shopId: string): Promise<StockMetrics> => {
  console.log(`📊 DashboardService: Calculando métricas do estoque - Loja ${shopId}`);
  
  try {
    const productRepo = await getProductRepository();
    const products = await productRepo.getAll(shopId);
    
    let totalStockValue = 0;
    const lowStockProducts: LowStockProduct[] = [];
    
    products.forEach(product => {
      // Calcular valor do estoque (apenas se tiver preço)
      if (product.price && product.price > 0) {
        totalStockValue += (product.stock || 0) * product.price;
      }
      
      // Verificar produtos com estoque baixo
      const currentStock = product.stock || 0;
      const minQuantity = product.minQuantity || 0;
      
      if (currentStock <= minQuantity) {
        lowStockProducts.push({
          id: product.id,
          name: product.name,
          currentStock,
          minQuantity,
        });
      }
    });
    
    const totalStockItems = products.reduce((sum, product) => 
      sum + (product.stock || 0), 0);
    
    const metrics: StockMetrics = {
      totalProducts: products.length,
      totalStockItems,
      totalStockValue,
      lowStockProducts,
      lowStockCount: lowStockProducts.length,
    };
    
    console.log(`✅ DashboardService: Métricas do estoque calculadas - ${products.length} produtos`);
    
    return metrics;
  } catch (error) {
    console.error('❌ DashboardService: Erro ao calcular métricas do estoque:', error);
    return {
      totalProducts: 0,
      totalStockItems: 0,
      totalStockValue: 0,
      lowStockProducts: [],
      lowStockCount: 0,
    };
  }
};

/**
 * Busca os produtos mais vendidos (Top 5)
 */
export const getTopProducts = async (shopId: string): Promise<TopProduct[]> => {
  console.log(`📊 DashboardService: Buscando produtos mais vendidos - Loja ${shopId}`);
  
  try {
    const result = await db.getAllAsync(`
      SELECT 
        product as name,
        SUM(itemsSold) as totalSold,
        SUM(total) as revenue
      FROM sales 
      WHERE shopId = ? 
        AND DATE(date) >= DATE('now', '-30 days')
      GROUP BY product
      ORDER BY totalSold DESC
      LIMIT 5
    `, [shopId]);

    const topProducts = result.map((item: any, index: number) => ({
      id: index + 1, // ID temporário para o gráfico
      name: item.name || 'Produto sem nome',
      totalSold: item.totalSold || 0,
      revenue: item.revenue || 0,
    }));
    
    console.log(`✅ DashboardService: ${topProducts.length} produtos mais vendidos encontrados`);
    
    return topProducts;
  } catch (error) {
    console.error('❌ DashboardService: Erro ao buscar produtos mais vendidos:', error);
    return [];
  }
};

/**
 * Busca dados de vendas dos últimos 30 dias para gráfico de linha
 */
export const getSalesLast30Days = async (shopId: string): Promise<SalesDataPoint[]> => {
  console.log(`📊 DashboardService: Buscando vendas dos últimos 30 dias - Loja ${shopId}`);
  
  try {
    const result = await db.getAllAsync(`
      SELECT 
        DATE(date) as date,
        COALESCE(SUM(total), 0) as sales
      FROM sales 
      WHERE shopId = ? 
        AND DATE(date) >= DATE('now', '-30 days')
      GROUP BY DATE(date)
      ORDER BY date ASC
    `, [shopId]);

    const salesData = result.map((item: any) => ({
      date: item.date,
      sales: item.sales || 0,
    }));
    
    console.log(`✅ DashboardService: Dados de ${salesData.length} dias obtidos`);
    
    return salesData;
  } catch (error) {
    console.error('❌ DashboardService: Erro ao buscar vendas dos últimos 30 dias:', error);
    return [];
  }
};

/**
 * Função principal que agrega todas as métricas do dashboard
 */
export const getAllDashboardMetrics = async (shopId: string): Promise<DashboardMetrics> => {
  console.log(`📊 DashboardService: Carregando todas as métricas - Loja ${shopId}`);
  
  try {
    const [
      daily,
      weekly,
      monthly,
      averageTicket,
      stockMetrics,
      topProducts,
      salesLast30Days,
    ] = await Promise.all([
      getDailySales(shopId),
      getWeeklySales(shopId),
      getMonthlySales(shopId),
      getAverageTicket(shopId),
      getStockMetrics(shopId),
      getTopProducts(shopId),
      getSalesLast30Days(shopId),
    ]);

    const metrics: DashboardMetrics = {
      daily,
      weekly,
      monthly,
      averageTicket,
      stockMetrics,
      topProducts,
      salesLast30Days,
    };
    
    console.log(`✅ DashboardService: Todas as métricas carregadas com sucesso`);
    
    return metrics;
  } catch (error) {
    console.error('❌ DashboardService: Erro ao carregar métricas:', error);
    throw error;
  }
};