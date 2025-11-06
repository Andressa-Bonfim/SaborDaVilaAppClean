import { db } from './database';

export const getAllProducts = () => {
  try {
    return db.getAllSync('SELECT * FROM products ORDER BY id DESC;');
  } catch (error) {
    console.error('Erro ao buscar produtos:', error);
    return [];
  }
};

export const insertProduct = (product: { name: string; quantity: number; minQuantity: number }) => {
  db.runSync(
    'INSERT INTO products (name, quantity, minQuantity) VALUES (?, ?, ?);',
    [product.name, product.quantity, product.minQuantity]
  );
};

export const updateProduct = (id: number, product: { name: string; quantity: number; minQuantity: number }) => {
  db.runSync(
    'UPDATE products SET name = ?, quantity = ?, minQuantity = ? WHERE id = ?;',
    [product.name, product.quantity, product.minQuantity, id]
  );
};

export const deleteProduct = (id: number) => {
  db.runSync('DELETE FROM products WHERE id = ?;', [id]);
};
