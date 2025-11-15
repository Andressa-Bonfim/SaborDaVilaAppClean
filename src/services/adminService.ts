import * as FileSystem from 'expo-file-system';
import * as DocumentPicker from 'expo-document-picker';
import * as Sharing from 'expo-sharing';
import { db } from '../database/database';

export class AdminService {
  
  // Verificar se o usuário é administrador
  static isAdmin(userRole: string): boolean {
    return userRole === 'admin';
  }

  // Fazer backup do banco de dados
  static async backupDatabase(): Promise<{ success: boolean; message: string; filePath?: string }> {
    try {
      // Caminho do banco atual
      const dbPath = FileSystem.documentDirectory + 'SQLite/saborDaVila.db';
      
      // Verificar se o arquivo existe
      try {
        const fileExists = await FileSystem.getInfoAsync(dbPath) as any;
        if (!fileExists?.exists) {
          return { success: false, message: 'Banco de dados não encontrado' };
        }
      } catch {
        return { success: false, message: 'Banco de dados não encontrado' };
      }

      // Criar nome do arquivo de backup com timestamp
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
      const backupFileName = `backup-saborDaVila-${timestamp}.db`;
      const backupPath = FileSystem.documentDirectory + backupFileName;

      // Copiar arquivo do banco para backup
      await FileSystem.copyAsync({
        from: dbPath,
        to: backupPath
      });

      // Verificar se pode compartilhar
      if (await Sharing.isAvailableAsync()) {
        await Sharing.shareAsync(backupPath, {
          mimeType: 'application/octet-stream',
          dialogTitle: 'Backup do Banco de Dados',
          UTI: 'public.database'
        });
      }

      return {
        success: true,
        message: 'Backup criado com sucesso!',
        filePath: backupPath
      };
    } catch (error) {
      console.error('❌ Erro ao fazer backup:', error);
      return { success: false, message: 'Erro ao criar backup do banco' };
    }
  }

  // Restaurar banco de dados a partir de arquivo
  static async restoreDatabase(): Promise<{ success: boolean; message: string }> {
    try {
      // Selecionar arquivo
      const result = await DocumentPicker.getDocumentAsync({
        type: 'application/octet-stream',
        copyToCacheDirectory: true
      });

      if (result.canceled || !result.assets || result.assets.length === 0) {
        return { success: false, message: 'Nenhum arquivo selecionado' };
      }

      const selectedFile = result.assets[0];
      
      // Verificar se é arquivo de banco
      if (!selectedFile.name.includes('.db')) {
        return { success: false, message: 'Arquivo deve ter extensão .db' };
      }

      // Caminho do banco atual
      const dbPath = FileSystem.documentDirectory + 'SQLite/saborDaVila.db';
      
      // Criar backup do banco atual antes de restaurar
      const currentTimestamp = new Date().toISOString().replace(/[:.]/g, '-');
      const currentBackupPath = FileSystem.documentDirectory + `backup-antes-restore-${currentTimestamp}.db`;
      
      try {
        const currentFileExists = await FileSystem.getInfoAsync(dbPath) as any;
        if (currentFileExists?.exists) {
          await FileSystem.copyAsync({
            from: dbPath,
            to: currentBackupPath
          });
          console.log('✅ Backup do banco atual criado antes da restauração');
        }
      } catch {
        console.log('⚠️ Banco atual não encontrado, prosseguindo com restauração');
      }

      // Copiar arquivo selecionado para o local do banco
      await FileSystem.copyAsync({
        from: selectedFile.uri,
        to: dbPath
      });

      // Reinicializar será necessário reiniciar o app
      console.log('✅ Banco restaurado, reinicie o aplicativo');

      return {
        success: true,
        message: 'Banco de dados restaurado com sucesso!\nReinicie o aplicativo para garantir que as mudanças sejam aplicadas.'
      };
    } catch (error) {
      console.error('❌ Erro ao restaurar banco:', error);
      return { success: false, message: 'Erro ao restaurar banco de dados' };
    }
  }

  // Obter estatísticas do banco
  static async getDatabaseStats(): Promise<{
    success: boolean;
    data?: {
      totalUsers: number;
      totalShops: number;
      totalProducts: number;
      totalSales: number;
      dbSize: string;
    };
    message?: string;
  }> {
    try {
      // Contar registros em cada tabela
      let usersCount = 0;
      let shopsCount = 0;
      let productsCount = 0;
      let salesCount = 0;

      try {
        const userResult = db.getAllSync('SELECT COUNT(*) as count FROM users') as any[];
        usersCount = userResult[0]?.count || 0;
      } catch (e) {
        console.warn('Tabela users não encontrada');
      }

      try {
        const shopResult = db.getAllSync('SELECT COUNT(*) as count FROM shops') as any[];
        shopsCount = shopResult[0]?.count || 0;
      } catch (e) {
        console.warn('Tabela shops não encontrada');
      }

      try {
        const productResult = db.getAllSync('SELECT COUNT(*) as count FROM products') as any[];
        productsCount = productResult[0]?.count || 0;
      } catch (e) {
        console.warn('Tabela products não encontrada');
      }

      try {
        const saleResult = db.getAllSync('SELECT COUNT(*) as count FROM sales') as any[];
        salesCount = saleResult[0]?.count || 0;
      } catch (e) {
        console.warn('Tabela sales não encontrada');
      }
      
      // Obter tamanho do arquivo (simplificado)
      const dbSize = 'Arquivo do banco existe';

      return {
        success: true,
        data: {
          totalUsers: usersCount,
          totalShops: shopsCount,
          totalProducts: productsCount,
          totalSales: salesCount,
          dbSize
        }
      };
    } catch (error) {
      console.error('❌ Erro ao obter estatísticas:', error);
      return { success: false, message: 'Erro ao obter estatísticas do banco' };
    }
  }

  // Limpar dados de teste (apenas para desenvolvimento)
  static async clearTestData(): Promise<{ success: boolean; message: string }> {
    try {
      // CUIDADO: Esta operação remove todos os dados exceto admin
      db.execSync('DELETE FROM sales');
      db.execSync('DELETE FROM products');
      db.execSync('DELETE FROM shops WHERE ownerId != (SELECT id FROM users WHERE userRole = "admin" LIMIT 1)');
      db.execSync('DELETE FROM users WHERE userRole != "admin"');
      
      return { success: true, message: 'Dados de teste removidos com sucesso!' };
    } catch (error) {
      console.error('❌ Erro ao limpar dados:', error);
      return { success: false, message: 'Erro ao limpar dados de teste' };
    }
  }
}