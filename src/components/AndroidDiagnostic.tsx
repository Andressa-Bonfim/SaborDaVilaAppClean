/**
 * Componente de diagnóstico para Android
 * Identifica problemas específicos da plataforma
 */

import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, Platform, Alert } from 'react-native';
import { db } from '../database/database';
import { Button } from './Button';
import { asyncStorageFallback } from '../database/asyncStorageFallback';

interface DiagnosticInfo {
  platform: string;
  sqliteStatus: string;
  dbConnection: string;
  tablesCount: number;
  error?: string;
}

export const AndroidDiagnostic: React.FC = () => {
  const [diagnostic, setDiagnostic] = useState<DiagnosticInfo | null>(null);
  const [isVisible, setIsVisible] = useState(Platform.OS === 'android');

  const runDiagnostic = async () => {
    try {
      const info: DiagnosticInfo = {
        platform: Platform.OS,
        sqliteStatus: 'Unknown',
        dbConnection: 'Unknown',
        tablesCount: 0,
      };

      // Verificar conexão do banco
      try {
        if (db) {
          info.dbConnection = 'Connected';
          info.sqliteStatus = 'Available';
          
          // Verificar tabelas
          const tables = db.getAllSync(
            "SELECT name FROM sqlite_master WHERE type='table'"
          ) as any[];
          
          info.tablesCount = tables.length;
        } else {
          info.dbConnection = 'Failed';
          info.sqliteStatus = 'Unavailable';
        }
      } catch (error) {
        info.error = `DB Error: ${error}`;
        info.dbConnection = 'Error';
      }

      setDiagnostic(info);
      
    } catch (error) {
      console.error('Erro no diagnóstico:', error);
      setDiagnostic({
        platform: Platform.OS,
        sqliteStatus: 'Error',
        dbConnection: 'Error',
        tablesCount: 0,
        error: `${error}`,
      });
    }
  };

  useEffect(() => {
    if (Platform.OS === 'android') {
      runDiagnostic();
    }
  }, []);

  const handleShowDetails = () => {
    if (!diagnostic) return;
    
    const message = `
Plataforma: ${diagnostic.platform}
SQLite Status: ${diagnostic.sqliteStatus}
DB Connection: ${diagnostic.dbConnection}
Tabelas: ${diagnostic.tablesCount}
${diagnostic.error ? `Erro: ${diagnostic.error}` : ''}
    `.trim();
    
    Alert.alert('Diagnóstico Android', message);
  };

  const handleUseFallback = async () => {
    try {
      Alert.alert(
        'Usar Fallback',
        'Deseja usar AsyncStorage como alternativa ao SQLite?',
        [
          { text: 'Cancelar', style: 'cancel' },
          {
            text: 'Sim, usar fallback',
            onPress: async () => {
              await asyncStorageFallback.seedData('test-shop');
              Alert.alert('Sucesso', 'Dados de exemplo criados via AsyncStorage');
            }
          }
        ]
      );
    } catch (error) {
      Alert.alert('Erro', `Falha no fallback: ${error}`);
    }
  };

  if (!isVisible || Platform.OS !== 'android') {
    return null;
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>🔧 Diagnóstico Android</Text>
      
      {diagnostic && (
        <View style={styles.info}>
          <Text style={styles.infoText}>
            SQLite: <Text style={styles.status}>{diagnostic.sqliteStatus}</Text>
          </Text>
          <Text style={styles.infoText}>
            DB: <Text style={styles.status}>{diagnostic.dbConnection}</Text>
          </Text>
          <Text style={styles.infoText}>
            Tabelas: <Text style={styles.status}>{diagnostic.tablesCount}</Text>
          </Text>
          
          {diagnostic.error && (
            <Text style={styles.error}>{diagnostic.error}</Text>
          )}
        </View>
      )}
      
      <View style={styles.buttons}>
        <Button
          title="Reexecutar Teste"
          onPress={runDiagnostic}
          variant="secondary"
          size="small"
        />
        <Button
          title="Detalhes"
          onPress={handleShowDetails}
          variant="secondary"
          size="small"
        />
        <Button
          title="Fechar"
          onPress={() => setIsVisible(false)}
          variant="secondary"
          size="small"
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 100,
    left: 20,
    right: 20,
    backgroundColor: '#1F2937',
    borderRadius: 8,
    padding: 16,
    borderWidth: 1,
    borderColor: '#374151',
    zIndex: 1000,
  },
  title: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 12,
    textAlign: 'center',
  },
  info: {
    marginBottom: 16,
  },
  infoText: {
    color: '#D1D5DB',
    fontSize: 14,
    marginBottom: 4,
  },
  status: {
    fontWeight: '600',
    color: '#10B981',
  },
  error: {
    color: '#EF4444',
    fontSize: 12,
    marginTop: 8,
    fontStyle: 'italic',
  },
  buttons: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    gap: 8,
  },
});