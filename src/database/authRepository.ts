import { db } from './database';
import { User, Shop, AuthUser } from '../types/auth';

// Flag para evitar inicializações concorrentes
let isAuthInitializing = false;
let isAuthInitialized = false;

const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

// Função para criar usuário admin se não existir
const createAdminUserIfNotExists = async () => {
  try {
    const adminEmail = 'admin@sabordavila.com';
    const existingAdmin = await db.getAllAsync<any>(
      'SELECT * FROM users WHERE email = ? OR userRole = "admin" LIMIT 1',
      [adminEmail]
    );

    if (existingAdmin.length === 0) {
      console.log('🚀 Criando usuário administrador...');
      
      // Senha padrão: admin123 (deve ser alterada no primeiro login)
      const bcrypt = require('expo-crypto');
      const adminPassword = 'admin123';
      const senhaHash = await bcrypt.digestStringAsync(
        bcrypt.CryptoDigestAlgorithm.SHA256,
        adminPassword
      );
      
      const adminId = 'admin-' + Date.now().toString();
      const dataCriacao = new Date().toISOString();
      
      await db.runAsync(
        `INSERT INTO users (id, nomeCompleto, email, tipoDocumento, numeroDocumento, endereco, userRole, senhaHash, dataCriacao) 
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [adminId, 'Administrador do Sistema', adminEmail, 'cpf', '00000000000', 'Sistema', 'admin', senhaHash, dataCriacao]
      );
      
      console.log('✅ Usuário administrador criado!');
      console.log('🔑 Email: admin@sabordavila.com');
      console.log('🔑 Senha: admin123 (altere no primeiro login)');
    }
  } catch (error) {
    console.error('❌ Erro ao criar usuário admin:', error);
  }
};

export const initializeAuthTables = async () => {
  // Evitar múltiplas inicializações simultâneas
  if (isAuthInitializing) {
    console.log('⏳ Aguardando inicialização de autenticação em progresso...');
    while (isAuthInitializing) {
      await sleep(100);
    }
    return;
  }

  if (isAuthInitialized) {
    console.log('✅ Tabelas de autenticação já inicializadas');
    return;
  }

  isAuthInitializing = true;
  console.log('🚀 Inicializando tabelas de autenticação...');

  try {
    // Usar transação para operações atômicas
    db.execSync('BEGIN TRANSACTION;');

    try {
      // Tabela de usuários
      db.execSync(`
        CREATE TABLE IF NOT EXISTS users (
          id TEXT PRIMARY KEY,
          nomeCompleto TEXT NOT NULL,
          email TEXT UNIQUE NOT NULL,
          tipoDocumento TEXT NOT NULL CHECK (tipoDocumento IN ('cpf', 'cnpj')),
          numeroDocumento TEXT NOT NULL,
          endereco TEXT NOT NULL,
          userRole TEXT NOT NULL DEFAULT 'user' CHECK (userRole IN ('user', 'admin')),
          senhaHash TEXT NOT NULL,
          dataCriacao TEXT NOT NULL
        );
      `);

      // Índices para melhor performance
      db.execSync(`
        CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
      `);

      db.execSync(`
        CREATE INDEX IF NOT EXISTS idx_users_documento ON users(tipoDocumento, numeroDocumento);
      `);

      // Tabela de lojas
      db.execSync(`
        CREATE TABLE IF NOT EXISTS shops (
          id TEXT PRIMARY KEY,
          nomeDaLoja TEXT NOT NULL,
          ownerId TEXT NOT NULL,
          dataCriacao TEXT NOT NULL,
          FOREIGN KEY (ownerId) REFERENCES users (id) ON DELETE CASCADE
        );
      `);

      // Índice para lojas
      db.execSync(`
        CREATE INDEX IF NOT EXISTS idx_shops_owner ON shops(ownerId);
      `);

      console.log('⚙️ Verificando migrações necessárias...');
      
      // Migração: Adicionar campo endereco se não existir
      try {
        // Verificar se a coluna endereco existe
        const tableInfo = db.getAllSync('PRAGMA table_info(users)') as any[];
        const hasEnderecoColumn = tableInfo.some(column => column.name === 'endereco');
        const hasUserRoleColumn = tableInfo.some(column => column.name === 'userRole');
        
        if (!hasEnderecoColumn) {
          console.log('🔄 Adicionando campo endereco à tabela users...');
          db.execSync('ALTER TABLE users ADD COLUMN endereco TEXT DEFAULT ""');
          console.log('✅ Campo endereco adicionado com sucesso!');
        }

        if (!hasUserRoleColumn) {
          console.log('🔄 Adicionando campo userRole à tabela users...');
          db.execSync('ALTER TABLE users ADD COLUMN userRole TEXT DEFAULT "user"');
          console.log('✅ Campo userRole adicionado com sucesso!');
        }

        // Criar usuário admin se não existir
        await createAdminUserIfNotExists();
        
      } catch (error) {
        console.error('❌ Erro na migração:', error);
      }

      db.execSync('COMMIT;');
      console.log('✅ Tabelas de autenticação criadas com sucesso');
      
    } catch (error) {
      db.execSync('ROLLBACK;');
      throw error;
    }

  } catch (error) {
    console.error('❌ Erro ao criar tabelas de autenticação:', error);
    throw error;
  } finally {
    isAuthInitialized = true;
    isAuthInitializing = false;
  }
};

export class UserRepository {
  
  async createUser(user: Omit<User, 'id' | 'dataCriacao'>): Promise<User> {
    try {
      const id = Date.now().toString();
      const dataCriacao = new Date().toISOString();
      
      await db.runAsync(
        `INSERT INTO users (id, nomeCompleto, email, tipoDocumento, numeroDocumento, endereco, userRole, senhaHash, dataCriacao) 
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [id, user.nomeCompleto, user.email, user.tipoDocumento, user.numeroDocumento, user.endereco, user.userRole || 'user', user.senhaHash, dataCriacao]
      );

      return {
        id,
        nomeCompleto: user.nomeCompleto,
        email: user.email,
        tipoDocumento: user.tipoDocumento,
        numeroDocumento: user.numeroDocumento,
        endereco: user.endereco,
        userRole: user.userRole || 'user',
        senhaHash: user.senhaHash,
        dataCriacao: new Date(dataCriacao)
      };
    } catch (error) {
      console.error('❌ Erro ao criar usuário:', error);
      throw error;
    }
  }

  async findByEmail(email: string): Promise<User | null> {
    try {
      const result = await db.getAllAsync<any>(
        'SELECT * FROM users WHERE email = ? LIMIT 1',
        [email]
      );

      if (result.length === 0) {
        return null;
      }

      const user = result[0];
      return {
        id: user.id,
        nomeCompleto: user.nomeCompleto,
        email: user.email,
        tipoDocumento: user.tipoDocumento,
        numeroDocumento: user.numeroDocumento,
        endereco: user.endereco,
        userRole: user.userRole || 'user',
        senhaHash: user.senhaHash,
        dataCriacao: new Date(user.dataCriacao)
      };
    } catch (error) {
      console.error('❌ Erro ao buscar usuário por email:', error);
      throw error;
    }
  }

  async findByDocument(tipoDocumento: 'cpf' | 'cnpj', numeroDocumento: string): Promise<User | null> {
    try {
      const result = await db.getAllAsync<any>(
        'SELECT * FROM users WHERE tipoDocumento = ? AND numeroDocumento = ? LIMIT 1',
        [tipoDocumento, numeroDocumento]
      );

      if (result.length === 0) {
        return null;
      }

      const user = result[0];
      return {
        id: user.id,
        nomeCompleto: user.nomeCompleto,
        email: user.email,
        tipoDocumento: user.tipoDocumento,
        numeroDocumento: user.numeroDocumento,
        endereco: user.endereco,
        userRole: user.userRole || 'user',
        senhaHash: user.senhaHash,
        dataCriacao: new Date(user.dataCriacao)
      };
    } catch (error) {
      console.error('❌ Erro ao buscar usuário por documento:', error);
      throw error;
    }
  }

  async findById(id: string): Promise<User | null> {
    try {
      const result = await db.getAllAsync<any>(
        'SELECT * FROM users WHERE id = ? LIMIT 1',
        [id]
      );

      if (result.length === 0) {
        return null;
      }

      const user = result[0];
      return {
        id: user.id,
        nomeCompleto: user.nomeCompleto,
        email: user.email,
        tipoDocumento: user.tipoDocumento,
        numeroDocumento: user.numeroDocumento,
        endereco: user.endereco,
        userRole: user.userRole || 'user',
        senhaHash: user.senhaHash,
        dataCriacao: new Date(user.dataCriacao)
      };
    } catch (error) {
      console.error('❌ Erro ao buscar usuário por ID:', error);
      throw error;
    }
  }
}

export class ShopRepository {

  async createShop(shop: Omit<Shop, 'id' | 'dataCriacao'>): Promise<Shop> {
    try {
      const id = Date.now().toString();
      const dataCriacao = new Date().toISOString();

      await db.runAsync(
        `INSERT INTO shops (id, nomeDaLoja, ownerId, dataCriacao) 
         VALUES (?, ?, ?, ?)`,
        [id, shop.nomeDaLoja, shop.ownerId, dataCriacao]
      );

      return {
        id,
        nomeDaLoja: shop.nomeDaLoja,
        ownerId: shop.ownerId,
        dataCriacao: new Date(dataCriacao)
      };
    } catch (error) {
      console.error('❌ Erro ao criar loja:', error);
      throw error;
    }
  }

  async findById(id: string): Promise<Shop | null> {
    try {
      const result = await db.getAllAsync<any>(
        'SELECT * FROM shops WHERE id = ? LIMIT 1',
        [id]
      );

      if (result.length === 0) {
        return null;
      }

      const shop = result[0];
      return {
        id: shop.id,
        nomeDaLoja: shop.nomeDaLoja,
        ownerId: shop.ownerId,
        dataCriacao: new Date(shop.dataCriacao)
      };
    } catch (error) {
      console.error('❌ Erro ao buscar loja por ID:', error);
      throw error;
    }
  }

  async findByOwnerId(ownerId: string): Promise<Shop[]> {
    try {
      const result = await db.getAllAsync<any>(
        'SELECT * FROM shops WHERE ownerId = ? ORDER BY dataCriacao DESC',
        [ownerId]
      );

      return result.map(shop => ({
        id: shop.id,
        nomeDaLoja: shop.nomeDaLoja,
        ownerId: shop.ownerId,
        dataCriacao: new Date(shop.dataCriacao)
      }));
    } catch (error) {
      console.error('❌ Erro ao buscar lojas por proprietário:', error);
      throw error;
    }
  }

  async updateShop(id: string, updates: Partial<Pick<Shop, 'nomeDaLoja'>>): Promise<boolean> {
    try {
      if (updates.nomeDaLoja === undefined) {
        return false;
      }

      const result = await db.runAsync(
        'UPDATE shops SET nomeDaLoja = ? WHERE id = ?',
        [updates.nomeDaLoja, id]
      );

      return result.changes > 0;
    } catch (error) {
      console.error('❌ Erro ao atualizar loja:', error);
      throw error;
    }
  }

  async deleteShop(id: string): Promise<boolean> {
    try {
      const result = await db.runAsync(
        'DELETE FROM shops WHERE id = ?',
        [id]
      );

      return result.changes > 0;
    } catch (error) {
      console.error('❌ Erro ao excluir loja:', error);
      throw error;
    }
  }
}