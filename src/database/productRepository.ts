import { db } from './database';

export interface Product {
  id: number;
  name: string;
  stock: number;
  quantity?: number; // Alias para stock (compatibilidade)
  price: number;
  costPrice?: number; // Valor de entrada/custo
  minQuantity: number;
  shopId: string;
  dateCreated?: string;
}

export interface ProductRepository {
  getAll: (shopId: string) => Promise<Product[]>;
  insert: (product: Omit<Product, 'id' | 'dateCreated'>) => Promise<void>;
  update: (id: number, product: Partial<Omit<Product, 'id' | 'shopId' | 'dateCreated'>>) => Promise<void>;
  delete: (id: number) => Promise<void>;
}

export async function getProductRepository(): Promise<ProductRepository> {
  // Garantir que a tabela existe com a estrutura correta
  await initializeProductsTable();

  return {
    getAll: async (shopId: string) => {
      try {
        const result = db.getAllSync('SELECT * FROM products WHERE shopId = ? ORDER BY id DESC;', [shopId]) as any[];
        // Mapear stock para quantity para compatibilidade
        return result.map(product => ({
          ...product,
          quantity: product.stock || product.quantity || 0
        })) as Product[];
      } catch (error) {
        console.error('Erro ao buscar produtos:', error);
        return [];
      }
    },

    insert: async (product) => {
      try {
        // Verificar se a tabela tem costPrice
        await ensureTableStructure();
        
        db.runSync(
          'INSERT INTO products (name, stock, price, costPrice, minQuantity, shopId) VALUES (?, ?, ?, ?, ?, ?);',
          [product.name, product.stock || 0, product.price || 0, product.costPrice || 0, product.minQuantity, product.shopId]
        );
        console.log(`✅ Produto inserido: ${product.name}`);
      } catch (error) {
        console.error('❌ Erro ao inserir produto:', error);
        throw error;
      }
    },

    update: async (id, product) => {
      try {
        const updates: string[] = [];
        const values: any[] = [];

        if (product.name !== undefined) {
          updates.push('name = ?');
          values.push(product.name);
        }
        if (product.stock !== undefined) {
          updates.push('stock = ?');
          values.push(product.stock);
        }
        if (product.price !== undefined) {
          updates.push('price = ?');
          values.push(product.price);
        }
        if (product.costPrice !== undefined) {
          updates.push('costPrice = ?');
          values.push(product.costPrice);
        }
        if (product.minQuantity !== undefined) {
          updates.push('minQuantity = ?');
          values.push(product.minQuantity);
        }

        if (updates.length === 0) return;

        values.push(id);
        const query = `UPDATE products SET ${updates.join(', ')} WHERE id = ?`;
        db.runSync(query, values);
      } catch (error) {
        console.error('Erro ao atualizar produto:', error);
        throw error;
      }
    },

    delete: async (id) => {
      try {
        db.runSync('DELETE FROM products WHERE id = ?;', [id]);
      } catch (error) {
        console.error('Erro ao deletar produto:', error);
        throw error;
      }
    },
  };
}

async function initializeProductsTable() {
  try {
    await ensureTableStructure();
    
    // Verificar se a tabela já tem a estrutura correta
    const tableInfo = db.getAllSync("PRAGMA table_info(products);");
    const hasStockColumn = tableInfo.some((col: any) => col.name === 'stock');
    const hasPriceColumn = tableInfo.some((col: any) => col.name === 'price');

    if (!hasStockColumn || !hasPriceColumn) {
      // Recriar a tabela com a estrutura correta
      db.runSync('DROP TABLE IF EXISTS products;');
      db.runSync(`
        CREATE TABLE IF NOT EXISTS products (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          name TEXT NOT NULL,
          stock INTEGER DEFAULT 0,
          price REAL DEFAULT 0.0,
          costPrice REAL DEFAULT 0.0,
          minQuantity INTEGER DEFAULT 5,
          shopId TEXT NOT NULL DEFAULT 'default-shop',
          dateCreated TEXT DEFAULT (datetime('now', 'localtime'))
        );
      `);
      
      // Inserir alguns produtos de exemplo se a tabela estiver vazia
      const count = db.getFirstSync('SELECT COUNT(*) as count FROM products;') as { count: number };
      if (count.count === 0) {
        const sampleProducts = [
          { name: 'Pão de Açúcar', stock: 50, price: 0.50, minQuantity: 10 },
          { name: 'Refrigerante 2L', stock: 30, price: 4.50, minQuantity: 5 },
          { name: 'Água Mineral', stock: 100, price: 1.50, minQuantity: 20 },
          { name: 'Biscoito Recheado', stock: 25, price: 2.80, minQuantity: 5 },
        ];

        for (const product of sampleProducts) {
          db.runSync(
            'INSERT INTO products (name, stock, price, minQuantity, shopId) VALUES (?, ?, ?, ?, ?);',
            [product.name, product.stock, product.price, product.minQuantity, 'default-shop']
          );
        }
      }
    }
  } catch (error) {
    console.error('Erro ao inicializar tabela de produtos:', error);
  }
}

async function ensureTableStructure() {
  try {
    // Verificar se costPrice existe
    const tableInfo = db.getAllSync("PRAGMA table_info(products);") as any[];
    const hasCostPrice = tableInfo.some(col => col.name === 'costPrice');
    
    if (!hasCostPrice) {
      console.log('➕ Adicionando coluna costPrice...');
      db.runSync('ALTER TABLE products ADD COLUMN costPrice REAL DEFAULT 0.0;');
      console.log('✅ Coluna costPrice adicionada');
    }
  } catch (error) {
    console.error('❌ Erro ao verificar estrutura da tabela:', error);
  }
}

// Funções de compatibilidade com o código existente
export const getAllProducts = () => {
  try {
    return db.getAllSync('SELECT * FROM products ORDER BY id DESC;');
  } catch (error) {
    console.error('Erro ao buscar produtos:', error);
    return [];
  }
};

export const insertProduct = (product: { name: string; quantity: number; minQuantity: number }) => {
  // Mapear quantity para stock para compatibilidade
  db.runSync(
    'INSERT INTO products (name, stock, price, minQuantity) VALUES (?, ?, ?, ?);',
    [product.name, product.quantity, 0, product.minQuantity]
  );
};

export const updateProduct = (id: number, product: { name: string; quantity: number; minQuantity: number }) => {
  // Mapear quantity para stock para compatibilidade
  db.runSync(
    'UPDATE products SET name = ?, stock = ?, minQuantity = ? WHERE id = ?;',
    [product.name, product.quantity, product.minQuantity, id]
  );
};

export const deleteProduct = (id: number) => {
  db.runSync('DELETE FROM products WHERE id = ?;', [id]);
};
