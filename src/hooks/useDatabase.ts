import { useEffect } from 'react';
import { initializeDatabase } from '../database/database';
import { initializeAuthTables } from '../database/authRepository';

export function useDatabase() {
  useEffect(() => {
    const initDatabases = async () => {
      try {
        // Inicializar tabelas básicas primeiro
        await initializeDatabase();
        
        // Depois inicializar tabelas de autenticação
        await initializeAuthTables();
        
        console.log('✅ Todas as tabelas inicializadas com sucesso');
      } catch (error) {
        console.error('❌ Erro ao inicializar databases:', error);
      }
    };

    initDatabases();
  }, []);
}
