import * as SQLite from 'expo-sqlite';
import * as FileSystem from 'expo-file-system/legacy';
import { Platform } from 'react-native';

const DB_NAME = 'saborDaVila.db';
const DB_PATH = `${FileSystem.documentDirectory}SQLite/${DB_NAME}`;

// Verificação de plataforma para Android
let db: SQLite.SQLiteDatabase;

try {
  if (Platform.OS === 'web') {
    console.warn('⚠️ SQLite não suportado no navegador');
  } else {
    db = SQLite.openDatabaseSync(DB_NAME);
    console.log('✅ Banco SQLite inicializado com sucesso');
  }
} catch (error) {
  console.error('❌ Erro ao abrir banco SQLite:', error);
}

export { db };

// Flag para evitar inicializações concorrentes
let isInitializing = false;
let isInitialized = false;

const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

export const initializeDatabase = async () => {
  // Verificar plataforma
  if (Platform.OS === 'web') {
    console.warn('⚠️ SQLite não suportado no navegador');
    return;
  }

  if (!db) {
    console.error('❌ Banco SQLite não inicializado');
    return;
  }

  // Evitar múltiplas inicializações simultâneas
  if (isInitializing) {
    console.log('⏳ Aguardando inicialização em progresso...');
    while (isInitializing) {
      await sleep(100);
    }
    return;
  }

  // Log específico para Android
  if (Platform.OS === 'android') {
    console.log('🤖 Inicializando SQLite no Android...');
  }

  if (isInitialized) {
    // Migração da tabela products para adicionar costPrice se não existir
    try {
      const productsTableInfo = db.getAllSync(`PRAGMA table_info(products)`) as any[];
      const hasCostPrice = productsTableInfo.some(col => col.name === 'costPrice');
      
      if (!hasCostPrice) {
        db.execSync('ALTER TABLE products ADD COLUMN costPrice REAL DEFAULT 0.0;');
        console.log('✅ Coluna costPrice adicionada à tabela products');
      }
    } catch (error) {
      console.error('❌ Erro ao migrar tabela products para costPrice:', error);
    }

    // Migração da tabela shops se necessário
  try {
    const shopsTableInfo = db.getAllSync(`PRAGMA table_info(shops)`) as any[];
    const hasDateCreated = shopsTableInfo.some(col => col.name === 'dateCreated');
    
    if (!hasDateCreated) {
      db.execSync('ALTER TABLE shops ADD COLUMN dateCreated TEXT;');
      // Atualizar registros existentes com data atual
      db.execSync('UPDATE shops SET dateCreated = datetime("now", "localtime") WHERE dateCreated IS NULL;');
      console.log('✅ Coluna dateCreated adicionada à tabela shops');
    }
  } catch (error) {
    console.error('❌ Erro ao migrar tabela shops:', error);
    // Criar tabela shops se não existir
    try {
      db.execSync(`
        CREATE TABLE IF NOT EXISTS shops (
          id TEXT PRIMARY KEY,
          name TEXT NOT NULL,
          description TEXT,
          address TEXT NOT NULL,
          phone TEXT,
          dateCreated TEXT DEFAULT (datetime('now', 'localtime'))
        );
      `);
      console.log('✅ Tabela shops criada');
    } catch (createError) {
      console.error('❌ Erro ao criar tabela shops:', createError);
    }
  }

  // Migração da tabela users se necessário
  try {
    const usersTableInfo = db.getAllSync(`PRAGMA table_info(users)`) as any[];
    const hasDateCreated = usersTableInfo.some(col => col.name === 'dateCreated');
    const hasRole = usersTableInfo.some(col => col.name === 'role');
    
    if (!hasDateCreated) {
      db.execSync('ALTER TABLE users ADD COLUMN dateCreated TEXT;');
      // Atualizar registros existentes com data atual
      db.execSync('UPDATE users SET dateCreated = datetime("now", "localtime") WHERE dateCreated IS NULL;');
      console.log('✅ Coluna dateCreated adicionada à tabela users');
    }
    
    if (!hasRole) {
      db.execSync('ALTER TABLE users ADD COLUMN role TEXT DEFAULT "user";');
      console.log('✅ Coluna role adicionada à tabela users');
    }
  } catch (error) {
    console.error('❌ Erro ao migrar tabela users:', error);
    // Criar tabela users se não existir
    try {
      db.execSync(`
        CREATE TABLE IF NOT EXISTS users (
          id TEXT PRIMARY KEY,
          email TEXT UNIQUE NOT NULL,
          password TEXT NOT NULL,
          name TEXT NOT NULL,
          cpfCnpj TEXT NOT NULL,
          address TEXT NOT NULL,
          phone TEXT,
          shopId TEXT NOT NULL,
          role TEXT DEFAULT 'user',
          dateCreated TEXT DEFAULT (datetime('now', 'localtime'))
        );
      `);
      console.log('✅ Tabela users criada');
    } catch (createError) {
      console.error('❌ Erro ao criar tabela users:', createError);
    }
  }

  console.log('✅ Migração das tabelas concluída');
    return;
  }

  isInitializing = true;
  
  try {
    console.log(`📍 Caminho do banco SQLite: ${DB_PATH}`);
    console.log('🔄 Iniciando inicialização do banco de dados...');
    
    // TEMPORÁRIO: Forçar reset das tabelas para aplicar correções
    forceTableReset();
    
    // Usar transação para operações atômicas
    db.execSync('BEGIN TRANSACTION;');

    try {
      // Verificar se as tabelas já existem
      const existingTables = db.getAllSync(`
        SELECT name FROM sqlite_master 
        WHERE type='table' AND name IN ('products', 'sales')
      `) as any[];

      console.log(`📋 Tabelas encontradas: ${existingTables.map(t => t.name).join(', ')}`);

      // Verificar estrutura das tabelas existentes
      let needsMigration = false;
      
      if (existingTables.length > 0) {
        for (const tableRow of existingTables) {
          const tableName = tableRow.name;
          try {
            const columns = db.getAllSync(`PRAGMA table_info(${tableName})`);
            const hasShopId = (columns as any[]).some(col => col.name === 'shopId');
            
            // Verificações específicas para cada tabela
            if (tableName === 'products') {
              const hasStock = (columns as any[]).some(col => col.name === 'stock');
              const hasPrice = (columns as any[]).some(col => col.name === 'price');
              
              if (!hasShopId || !hasStock || !hasPrice) {
                console.log(`🔄 Tabela ${tableName} precisa de migração (falta: ${!hasShopId ? 'shopId ' : ''}${!hasStock ? 'stock ' : ''}${!hasPrice ? 'price' : ''})`);
                needsMigration = true;
              }
            } else if (!hasShopId) {
              console.log(`🔄 Tabela ${tableName} precisa de migração (falta shopId)`);
              needsMigration = true;
            }
          } catch (error) {
            console.error(`❌ Erro ao verificar estrutura da tabela ${tableName}:`, error);
            needsMigration = true;
          }
        }
      }

      if (needsMigration) {
        console.log('🔄 Executando migração das tabelas...');
        await migrateTables();
      } else if (existingTables.length === 0) {
        console.log('📝 Criando tabelas pela primeira vez...');
        await createTables();
      } else {
        console.log('✅ Tabelas já existem com estrutura correta');
      }

      // Criar índices se não existirem
      db.execSync(`CREATE INDEX IF NOT EXISTS idx_products_shop ON products(shopId);`);
      db.execSync(`CREATE INDEX IF NOT EXISTS idx_sales_shop ON sales(shopId);`);

      db.execSync('COMMIT;');
      console.log('✅ Banco de dados inicializado com sucesso');
      
    } catch (error) {
      db.execSync('ROLLBACK;');
      throw error;
    }

  } catch (error) {
    console.error('❌ Erro ao inicializar banco:', error);
    
    // Fallback: tentar criar tabelas básicas
    try {
      console.log('🆘 Tentando fallback...');
      await createBasicTables();
    } catch (fallbackError) {
      console.error('❌ Erro crítico no banco de dados:', fallbackError);
    }
  } finally {
    isInitialized = true;
    isInitializing = false;
  }
};

const createTables = async () => {
  db.execSync(`
    CREATE TABLE IF NOT EXISTS products (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      quantity INTEGER NOT NULL,
      minQuantity INTEGER NOT NULL,
      price REAL NOT NULL DEFAULT 0.0,
      costPrice REAL NOT NULL DEFAULT 0.0,
      shopId TEXT NOT NULL DEFAULT 'default-shop',
      dateCreated TEXT DEFAULT (datetime('now', 'localtime'))
    );
  `);

  db.execSync(`
    CREATE TABLE IF NOT EXISTS sales (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      product TEXT NOT NULL,
      itemsSold INTEGER NOT NULL,
      total REAL NOT NULL,
      shopId TEXT NOT NULL DEFAULT 'default-shop',
      date TEXT DEFAULT (datetime('now', 'localtime'))
    );
  `);
};

const migrateTables = async () => {
  // Migrar products
  try {
    // Primeiro verificar estrutura atual da tabela products
    const productsColumns = db.getAllSync(`PRAGMA table_info(products)`);
    const hasDateCreated = (productsColumns as any[]).some(col => col.name === 'dateCreated');
    const hasShopId = (productsColumns as any[]).some(col => col.name === 'shopId');
    const hasStock = (productsColumns as any[]).some(col => col.name === 'stock');
    const hasPrice = (productsColumns as any[]).some(col => col.name === 'price');

    // Criar nova tabela com estrutura correta
    db.execSync(`
      CREATE TABLE IF NOT EXISTS products_new (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        stock INTEGER NOT NULL DEFAULT 0,
        price REAL NOT NULL DEFAULT 0.0,
        costPrice REAL NOT NULL DEFAULT 0.0,
        minQuantity INTEGER NOT NULL DEFAULT 5,
        shopId TEXT NOT NULL DEFAULT 'default-shop',
        dateCreated TEXT DEFAULT (datetime('now', 'localtime'))
      );
    `);

    // Copiar dados baseado nas colunas disponíveis
    if (hasDateCreated && hasShopId && hasStock && hasPrice) {
      // Verificar se tem costPrice
      const hasCostPrice = (productsColumns as any[]).some(col => col.name === 'costPrice');
      
      if (hasCostPrice) {
        // Tabela já tem todas as colunas incluindo costPrice
        db.execSync(`
          INSERT INTO products_new (id, name, stock, price, costPrice, minQuantity, shopId, dateCreated)
          SELECT id, name, stock, price, costPrice, minQuantity, shopId, dateCreated FROM products;
        `);
      } else {
        // Tem todas as colunas mas não costPrice
        db.execSync(`
          INSERT INTO products_new (id, name, stock, price, costPrice, minQuantity, shopId, dateCreated)
          SELECT id, name, stock, price, 0.0, minQuantity, shopId, dateCreated FROM products;
        `);
      }
    } else if (hasStock && hasPrice) {
      // Tem stock e price mas pode não ter shopId/dateCreated/costPrice
      const hasCostPrice = (productsColumns as any[]).some(col => col.name === 'costPrice');
      const shopIdCol = hasShopId ? 'shopId' : "'default-shop'";
      const dateCol = hasDateCreated ? 'dateCreated' : "datetime('now', 'localtime')";
      const costPriceCol = hasCostPrice ? 'costPrice' : '0.0';
      
      db.execSync(`
        INSERT INTO products_new (id, name, stock, price, costPrice, minQuantity, shopId, dateCreated)
        SELECT id, name, stock, price, ${costPriceCol}, minQuantity, ${shopIdCol}, ${dateCol} FROM products;
      `);
    } else {
      // Tabela antiga com quantity - migrar para stock
      const stockCol = hasStock ? 'stock' : 'quantity';
      const shopIdCol = hasShopId ? 'shopId' : "'default-shop'";
      const dateCol = hasDateCreated ? 'dateCreated' : "datetime('now', 'localtime')";
      
      db.execSync(`
        INSERT INTO products_new (id, name, stock, price, costPrice, minQuantity, shopId, dateCreated)
        SELECT id, name, ${stockCol}, 0.0, 0.0, minQuantity, ${shopIdCol}, ${dateCol} FROM products;
      `);
    }

    db.execSync('DROP TABLE products;');
    db.execSync('ALTER TABLE products_new RENAME TO products;');
    console.log('✅ Tabela products migrada com sucesso');
  } catch (error) {
    console.error('❌ Erro ao migrar products:', error);
    // Se falhar, criar tabela básica
    try {
      db.execSync('DROP TABLE IF EXISTS products;');
      db.execSync(`
        CREATE TABLE products (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          name TEXT NOT NULL,
          stock INTEGER NOT NULL DEFAULT 0,
          price REAL NOT NULL DEFAULT 0.0,
          costPrice REAL NOT NULL DEFAULT 0.0,
          minQuantity INTEGER NOT NULL DEFAULT 5,
          shopId TEXT NOT NULL DEFAULT 'default-shop',
          dateCreated TEXT DEFAULT (datetime('now', 'localtime'))
        );
      `);
      console.log('✅ Tabela products recriada');
    } catch (createError) {
      console.error('❌ Erro ao recriar products:', createError);
    }
  }

  // Migrar sales
  try {
    // Verificar estrutura atual da tabela sales
    const salesColumns = db.getAllSync(`PRAGMA table_info(sales)`);
    const hasDate = (salesColumns as any[]).some(col => col.name === 'date');
    const hasShopId = (salesColumns as any[]).some(col => col.name === 'shopId');

    // Criar nova tabela
    db.execSync(`
      CREATE TABLE IF NOT EXISTS sales_new (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        product TEXT NOT NULL,
        itemsSold INTEGER NOT NULL,
        total REAL NOT NULL,
        shopId TEXT NOT NULL DEFAULT 'default-shop',
        date TEXT DEFAULT (datetime('now', 'localtime'))
      );
    `);

    // Copiar dados baseado nas colunas disponíveis
    if (hasDate && hasShopId) {
      // Tabela já tem todas as colunas
      db.execSync(`
        INSERT INTO sales_new (id, product, itemsSold, total, shopId, date)
        SELECT id, product, itemsSold, total, shopId, date FROM sales;
      `);
    } else if (hasDate && !hasShopId) {
      // Tem date mas não shopId
      db.execSync(`
        INSERT INTO sales_new (id, product, itemsSold, total, shopId, date)
        SELECT id, product, itemsSold, total, 'default-shop', date FROM sales;
      `);
    } else if (!hasDate && hasShopId) {
      // Tem shopId mas não date
      db.execSync(`
        INSERT INTO sales_new (id, product, itemsSold, total, shopId, date)
        SELECT id, product, itemsSold, total, shopId, datetime('now', 'localtime') FROM sales;
      `);
    } else {
      // Não tem nenhuma das duas colunas
      db.execSync(`
        INSERT INTO sales_new (id, product, itemsSold, total, shopId, date)
        SELECT id, product, itemsSold, total, 'default-shop', datetime('now', 'localtime') FROM sales;
      `);
    }

    db.execSync('DROP TABLE sales;');
    db.execSync('ALTER TABLE sales_new RENAME TO sales;');
    console.log('✅ Tabela sales migrada com sucesso');
  } catch (error) {
    console.error('❌ Erro ao migrar sales:', error);
    // Se falhar, criar tabela básica
    try {
      db.execSync('DROP TABLE IF EXISTS sales;');
      db.execSync(`
        CREATE TABLE sales (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          product TEXT NOT NULL,
          itemsSold INTEGER NOT NULL,
          total REAL NOT NULL,
          shopId TEXT NOT NULL DEFAULT 'default-shop',
          date TEXT DEFAULT (datetime('now', 'localtime'))
        );
      `);
      console.log('✅ Tabela sales recriada');
    } catch (createError) {
      console.error('❌ Erro ao recriar sales:', createError);
    }
  }
};

const createBasicTables = async () => {
  db.execSync(`
    CREATE TABLE IF NOT EXISTS products (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      stock INTEGER NOT NULL DEFAULT 0,
      price REAL NOT NULL DEFAULT 0.0,
      costPrice REAL NOT NULL DEFAULT 0.0,
      minQuantity INTEGER NOT NULL DEFAULT 5,
      shopId TEXT NOT NULL DEFAULT 'default-shop',
      dateCreated TEXT DEFAULT (datetime('now', 'localtime'))
    );
  `);

  db.execSync(`
    CREATE TABLE IF NOT EXISTS sales (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      product TEXT NOT NULL,
      itemsSold INTEGER NOT NULL,
      total REAL NOT NULL,
      shopId TEXT NOT NULL DEFAULT 'default-shop',
      date TEXT DEFAULT (datetime('now', 'localtime'))
    );
  `);
  
  console.log('⚠️ Fallback: tabelas básicas criadas');
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
    
    // Resetar flags para forçar reinicialização
    isInitialized = false;
    isInitializing = false;
    
  } catch (error) {
    console.error('❌ Erro ao remover banco:', error);
  }
};

// Função temporal para forçar recreação das tabelas
export const forceTableReset = () => {
  try {
    console.log('🔄 Forçando reset das tabelas...');
    
    // Drop e recriar tabelas
    db.execSync('DROP TABLE IF EXISTS products;');
    db.execSync('DROP TABLE IF EXISTS sales;');
    
    // Recriar com estrutura correta
    db.execSync(`
      CREATE TABLE products (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        stock INTEGER NOT NULL DEFAULT 0,
        price REAL NOT NULL DEFAULT 0.0,
        costPrice REAL NOT NULL DEFAULT 0.0,
        minQuantity INTEGER NOT NULL DEFAULT 5,
        shopId TEXT NOT NULL DEFAULT 'default-shop',
        dateCreated TEXT DEFAULT (datetime('now', 'localtime'))
      );
    `);
    
    db.execSync(`
      CREATE TABLE sales (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        product TEXT NOT NULL,
        itemsSold INTEGER NOT NULL,
        total REAL NOT NULL,
        shopId TEXT NOT NULL DEFAULT 'default-shop',
        date TEXT DEFAULT (datetime('now', 'localtime'))
      );
    `);
    
    // Criar índices
    db.execSync(`CREATE INDEX IF NOT EXISTS idx_products_shop ON products(shopId);`);
    db.execSync(`CREATE INDEX IF NOT EXISTS idx_sales_shop ON sales(shopId);`);
    
    console.log('✅ Tabelas resetadas com sucesso');
    
  } catch (error) {
    console.error('❌ Erro ao resetar tabelas:', error);
  }
};
