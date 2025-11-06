import * as SQLite from 'expo-sqlite';
import { DailySales, SalesSummary } from '../types/sales';

const db = SQLite.openDatabaseSync('saborDaVila.db');

export async function initializeSalesTable() {
  try {
    await db.execAsync(`
      CREATE TABLE IF NOT EXISTS sales (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        product TEXT NOT NULL,
        itemsSold INTEGER NOT NULL,
        total REAL NOT NULL
      );
    `);

    // Adiciona coluna createdAt caso não exista
    try {
      await db.execAsync(`ALTER TABLE sales ADD COLUMN createdAt TEXT DEFAULT (datetime('now'));`);
      await db.execAsync(`UPDATE sales SET createdAt = datetime('now') WHERE createdAt IS NULL;`);
    } catch {
      // ignora erro se a coluna já existir
    }

    console.log('✅ Tabela sales inicializada com sucesso!');
  } catch (error) {
    console.error('❌ Erro ao inicializar tabela sales:', error);
  }
}


// 🔹 Inserir nova venda
export async function insertSale(product: string, itemsSold: number, total: number) {
  await db.runAsync(
    'INSERT INTO sales (product, itemsSold, total) VALUES (?, ?, ?);',
    [product, itemsSold, total]
  );
}

// 🔹 Buscar todas as vendas recentes (últimas 20)
export async function getRecentSales(): Promise<any[]> {
  const result = await db.getAllAsync<any>(
    'SELECT * FROM sales ORDER BY id DESC LIMIT 20;'
  );
  return result || [];
}

// 🔹 Atualizar venda existente
export async function updateSale(id: number, product: string, itemsSold: number, total: number) {
  await db.runAsync(
    'UPDATE sales SET product = ?, itemsSold = ?, total = ? WHERE id = ?;',
    [product, itemsSold, total, id]
  );
}

// 🔹 Excluir venda
export async function deleteSale(id: number) {
  await db.runAsync('DELETE FROM sales WHERE id = ?;', [id]);
}

// 🔹 Total de vendas do dia
export async function getDailySales(): Promise<DailySales> {
  try {
    const result = await db.getFirstAsync<DailySales>(`
      SELECT 
        COALESCE(SUM(total), 0) AS total,
        COALESCE(SUM(itemsSold), 0) AS items
      FROM sales
      WHERE date(createdAt) = date('now');
    `);
    return result || { total: 0, items: 0 };
  } catch (error) {
    console.error('❌ Erro ao calcular vendas do dia:', error);
    return { total: 0, items: 0 };
  }
}

// 🔹 Resumo semanal
export async function getWeeklySummary(): Promise<SalesSummary> {
  try {
    const result = await db.getFirstAsync<SalesSummary>(`
      SELECT 
        COALESCE(SUM(total), 0) AS total,
        COALESCE(SUM(itemsSold), 0) AS items,
        CASE WHEN SUM(itemsSold) > 0 THEN SUM(total) / SUM(itemsSold) ELSE 0 END AS avgTicket
      FROM sales
      WHERE date(createdAt) >= date('now', '-7 days');
    `);
    return result || { total: 0, items: 0, avgTicket: 0 };
  } catch (error) {
    console.error('❌ Erro ao gerar resumo semanal:', error);
    return { total: 0, items: 0, avgTicket: 0 };
  }
}
