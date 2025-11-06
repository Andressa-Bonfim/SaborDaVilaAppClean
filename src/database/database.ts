import * as SQLite from 'expo-sqlite';
import * as FileSystem from 'expo-file-system';

const DB_NAME = 'saborDaVila.db';
const DB_PATH = `${FileSystem.documentDirectory}SQLite/${DB_NAME}`;

export const db = SQLite.openDatabaseSync(DB_NAME);

export const initializeDatabase = () => {
  console.log(`📍 Caminho do banco SQLite: ${DB_PATH}`);

  try {
    // Tabela de produtos
    db.execSync(`
      CREATE TABLE IF NOT EXISTS products (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        quantity INTEGER NOT NULL,
        minQuantity INTEGER NOT NULL
      );
    `);

    // Tabela de vendas
    db.execSync(`
      CREATE TABLE IF NOT EXISTS sales (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        product TEXT NOT NULL,
        itemsSold INTEGER NOT NULL,
        total REAL NOT NULL,
        date TEXT DEFAULT (datetime('now', 'localtime'))
      );
    `);

    console.log('✅ Banco de dados inicializado e tabelas criadas');
  } catch (error) {
    console.error('❌ Erro ao criar tabelas:', error);
  }
};

export const resetDatabase = async () => {
  try {
    const info = await (FileSystem as any).getInfoAsync(DB_PATH);
    if (info.exists) {
      await (FileSystem as any).deleteAsync(DB_PATH, { idempotent: true });
      console.log('🗑️ Banco removido com sucesso:', DB_PATH);
    } else {
      console.log('ℹ️ Banco não encontrado, nada a remover.');
    }
  } catch (error) {
    console.error('❌ Erro ao remover banco:', error);
  }
};
