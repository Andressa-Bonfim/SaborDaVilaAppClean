import React from "react";
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert, Platform } from "react-native";
import { StatusBar } from 'expo-status-bar';
import { Download, Database, Settings, Info, FileText, BarChart3, Package, LogOut, Shield, Upload } from 'lucide-react-native';
import { exportDatabase } from "../../database/exportDatabase";
import { 
  generateSalesReportPDF, 
  generateInventoryReportPDF, 
  generateSalesProductReportPDF,
  generateSalesExcelData,
  generateInventoryExcelData 
} from "../../services/reportService";
import { AdminService } from "../../services/adminService";
import { Header } from "../../components/Header";
import { Button } from "../../components/Button";
import { useAuth } from "../../context/AuthContext";
import { useRouter } from "expo-router";

export default function DebugScreen() {
  const { logout, user, isAdmin, activeShop } = useAuth();
  const router = useRouter();

  // Funções wrapper que passam o shopId
  const handleGenerateSalesReportPDF = () => {
    if (!activeShop?.id) {
      Alert.alert('Erro', 'Nenhuma loja ativa encontrada.');
      return;
    }
    generateSalesReportPDF(activeShop.id);
  };

  const handleGenerateInventoryReportPDF = () => {
    if (!activeShop?.id) {
      Alert.alert('Erro', 'Nenhuma loja ativa encontrada.');
      return;
    }
    generateInventoryReportPDF(activeShop.id);
  };

  const handleGenerateSalesProductReportPDF = () => {
    if (!activeShop?.id) {
      Alert.alert('Erro', 'Nenhuma loja ativa encontrada.');
      return;
    }
    generateSalesProductReportPDF(activeShop.id);
  };

  const handleGenerateSalesExcelData = () => {
    if (!activeShop?.id) {
      Alert.alert('Erro', 'Nenhuma loja ativa encontrada.');
      return;
    }
    console.log('🔄 Iniciando geração de CSV de vendas...');
    generateSalesExcelData(activeShop.id);
  };

  const handleGenerateInventoryExcelData = () => {
    if (!activeShop?.id) {
      Alert.alert('Erro', 'Nenhuma loja ativa encontrada.');
      return;
    }
    console.log('🔄 Iniciando geração de CSV de estoque...');
    generateInventoryExcelData(activeShop.id);
  };

  const handleExitApp = () => {
    Alert.alert(
      'Fechar Aplicativo',
      'Como deseja sair do aplicativo?',
      [
        { text: 'Cancelar', style: 'cancel' },
        { 
          text: 'Logout', 
          onPress: async () => {
            try {
              await logout();
              router.replace('/login');
            } catch (error) {
              console.error('Erro no logout:', error);
              Alert.alert('Erro', 'Não foi possível fazer logout');
            }
          }
        },
        { 
          text: 'Fechar App', 
          style: 'destructive',
          onPress: () => {
            try {
              if (Platform.OS === 'android') {
                // Importar BackHandler dinamicamente
                const BackHandler = require('react-native').BackHandler;
                
                // Verificar se estamos em modo desenvolvimento
                if (__DEV__) {
                  // Em desenvolvimento, mostrar informação
                  Alert.alert(
                    'Modo Desenvolvimento',
                    'Para fechar o app em desenvolvimento:\n1. Pressione o botão Home\n2. Feche o Metro Bundler no terminal\n3. Remova o app da lista de apps recentes',
                    [{ text: 'Entendido' }]
                  );
                } else {
                  // Em produção, tentar fechar
                  BackHandler.exitApp();
                }
              } else {
                // Para iOS
                Alert.alert(
                  'iOS',
                  'No iOS, use o botão Home para minimizar o app ou deslize para cima na tela inicial para fechar.',
                  [{ text: 'Entendido' }]
                );
              }
            } catch (error) {
              console.error('Erro ao tentar sair:', error);
              Alert.alert(
                'Como fechar o app',
                'Para fechar completamente:\n• Pressione o botão Home do dispositivo\n• Deslize para cima (Android) ou duas vezes (iOS)\n• Remova o app da lista de apps recentes',
                [{ text: 'Entendido' }]
              );
            }
          }
        }
      ]
    );
  };

  // Funções Admin
  const handleBackupDatabase = async () => {
    if (!isAdmin) {
      Alert.alert('Erro', 'Acesso negado. Apenas administradores podem fazer backup.');
      return;
    }

    Alert.alert(
      'Backup do Banco',
      'Criar backup completo do banco de dados?',
      [
        { text: 'Cancelar', style: 'cancel' },
        { 
          text: 'Criar Backup', 
          onPress: async () => {
            const result = await AdminService.backupDatabase();
            Alert.alert(
              result.success ? 'Sucesso' : 'Erro',
              result.message
            );
          }
        }
      ]
    );
  };

  const handleRestoreDatabase = async () => {
    if (!isAdmin) {
      Alert.alert('Erro', 'Acesso negado. Apenas administradores podem restaurar backup.');
      return;
    }

    Alert.alert(
      'Restaurar Banco',
      '⚠️ ATENÇÃO: Esta operação irá substituir todos os dados atuais.\n\nDeseja continuar?',
      [
        { text: 'Cancelar', style: 'cancel' },
        { 
          text: 'Restaurar', 
          style: 'destructive',
          onPress: async () => {
            const result = await AdminService.restoreDatabase();
            Alert.alert(
              result.success ? 'Sucesso' : 'Erro',
              result.message,
              [{ text: 'OK', onPress: () => {
                if (result.success) {
                  // Sugerir reinício do app
                  handleExitApp();
                }
              }}]
            );
          }
        }
      ]
    );
  };

  const handleShowDatabaseStats = async () => {
    if (!isAdmin) {
      Alert.alert('Erro', 'Acesso negado. Apenas administradores podem ver estatísticas.');
      return;
    }

    const result = await AdminService.getDatabaseStats();
    if (result.success && result.data) {
      const stats = result.data;
      Alert.alert(
        'Estatísticas do Banco',
        `Usuários: ${stats.totalUsers}\nLojas: ${stats.totalShops}\nProdutos: ${stats.totalProducts}\nVendas: ${stats.totalSales}\nTamanho: ${stats.dbSize}`,
        [{ text: 'OK' }]
      );
    } else {
      Alert.alert('Erro', result.message || 'Erro ao obter estatísticas');
    }
  };

  return (
    <View style={styles.container}>
      <StatusBar translucent style="light" />
      <Header title="Debug & Configurações" />
      
      <ScrollView style={styles.scrollView}>
        {/* Informações sobre o Debug */}
        <View style={styles.infoSection}>
          <View style={styles.infoHeader}>
            <Info color="#6366F1" size={24} />
            <Text style={styles.infoTitle}>Sobre esta tela</Text>
          </View>
          <Text style={styles.infoText}>
            Esta é a tela de debug e configurações do aplicativo Sabor da Vila. 
            Aqui você pode exportar o banco de dados, visualizar informações do sistema 
            e realizar operações de manutenção.
          </Text>
        </View>

        {/* Card de Exportação de Banco - APENAS ADMIN */}
        {isAdmin && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Exportar Banco de Dados</Text>
            
            <View style={styles.exportCard}>
              <View style={styles.exportHeader}>
                <Database color="#10B981" size={32} />
                <View style={styles.exportInfo}>
                  <Text style={styles.exportTitle}>Banco de Dados SQLite</Text>
                  <Text style={styles.exportDescription}>
                    Exportar arquivo SQLite com todas as vendas e produtos
                  </Text>
                </View>
              </View>
              
              <Button
                title="Exportar Banco"
                onPress={exportDatabase}
                size="medium"
                icon={<Download color="#10B981" size={20} />}
              />
            </View>
          </View>
        )}

        {/* Relatórios em PDF */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Relatórios em PDF</Text>
          
          <View style={styles.reportsContainer}>
            <View style={styles.reportCard}>
              <FileText color="#EF4444" size={24} />
              <Text style={styles.reportTitle}>Vendas</Text>
              <Text style={styles.reportDesc}>Relatório completo de vendas</Text>
              <Button
                title="PDF"
                onPress={handleGenerateSalesReportPDF}
                size="small"
              />
            </View>

            <View style={styles.reportCard}>
              <Package color="#F97316" size={24} />
              <Text style={styles.reportTitle}>Estoque</Text>
              <Text style={styles.reportDesc}>Relatório de produtos em estoque</Text>
              <Button
                title="PDF"
                onPress={handleGenerateInventoryReportPDF}
                size="small"
              />
            </View>

            <View style={styles.reportCard}>
              <BarChart3 color="#3B82F6" size={24} />
              <Text style={styles.reportTitle}>Produto</Text>
              <Text style={styles.reportDesc}>Vendas agrupadas por produto</Text>
              <Button
                title="PDF"
                onPress={handleGenerateSalesProductReportPDF}
                size="small"
              />
            </View>
          </View>
        </View>

        {/* Exportar para Excel */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Exportar para Excel</Text>
          
          <View style={styles.excelContainer}>
            <View style={styles.excelCard}>
              <View style={styles.excelHeader}>
                <FileText color="#059669" size={24} />
                <Text style={styles.excelTitle}>Dados de Vendas</Text>
              </View>
              <Text style={styles.excelDesc}>Exportar todas as vendas em formato CSV para Excel</Text>
              <Button
                title="Exportar CSV"
                onPress={handleGenerateSalesExcelData}
                size="medium"
              />
            </View>

            <View style={styles.excelCard}>
              <View style={styles.excelHeader}>
                <Package color="#059669" size={24} />
                <Text style={styles.excelTitle}>Dados de Estoque</Text>
              </View>
              <Text style={styles.excelDesc}>Exportar inventário completo em formato CSV para Excel</Text>
              <Button
                title="Exportar CSV"
                onPress={handleGenerateInventoryExcelData}
                size="medium"
              />
            </View>
          </View>
        </View>

        {/* Informações do Sistema */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Informações do Sistema</Text>
          
          <View style={styles.systemInfo}>
            <View style={styles.systemItem}>
              <Settings color="#6366F1" size={20} />
              <View style={styles.systemItemText}>
                <Text style={styles.systemItemLabel}>Versão do App</Text>
                <Text style={styles.systemItemValue}>1.0.0</Text>
              </View>
            </View>
            
            <View style={styles.systemItem}>
              <Database color="#6366F1" size={20} />
              <View style={styles.systemItemText}>
                <Text style={styles.systemItemLabel}>Banco de Dados</Text>
                <Text style={styles.systemItemValue}>SQLite Local</Text>
              </View>
            </View>

            {isAdmin && (
              <View style={styles.systemItem}>
                <Shield color="#10B981" size={20} />
                <View style={styles.systemItemText}>
                  <Text style={styles.systemItemLabel}>Usuário</Text>
                  <Text style={[styles.systemItemValue, { color: '#10B981' }]}>Administrador</Text>
                </View>
              </View>
            )}
          </View>
        </View>

        {/* Ferramentas de Administrador */}
        {isAdmin && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>🛡️ Administrador</Text>
            
            <View style={styles.actionsContainer}>
              <TouchableOpacity
                style={styles.adminButton}
                onPress={handleBackupDatabase}
              >
                <Upload color="#10B981" size={20} />
                <View style={styles.adminButtonContent}>
                  <Text style={styles.adminButtonTitle}>Backup do Banco</Text>
                  <Text style={styles.adminButtonDesc}>Criar backup completo do banco de dados</Text>
                </View>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.adminButton}
                onPress={handleRestoreDatabase}
              >
                <Download color="#F59E0B" size={20} />
                <View style={styles.adminButtonContent}>
                  <Text style={styles.adminButtonTitle}>Restaurar Banco</Text>
                  <Text style={styles.adminButtonDesc}>Restaurar banco a partir de arquivo</Text>
                </View>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.adminButton}
                onPress={handleShowDatabaseStats}
              >
                <BarChart3 color="#3B82F6" size={20} />
                <View style={styles.adminButtonContent}>
                  <Text style={styles.adminButtonTitle}>Estatísticas do Banco</Text>
                  <Text style={styles.adminButtonDesc}>Ver informações detalhadas do banco</Text>
                </View>
              </TouchableOpacity>
            </View>
          </View>
        )}

        {/* Ações do App */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Ações do App</Text>
          
          <View style={styles.actionsContainer}>
            <TouchableOpacity
              style={styles.exitButton}
              onPress={handleExitApp}
            >
              <LogOut color="#EF4444" size={24} />
              <View style={styles.exitButtonContent}>
                <Text style={styles.exitButtonTitle}>Sair do Aplicativo</Text>
                <Text style={styles.exitButtonDesc}>Fechar completamente o app</Text>
              </View>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#09090B',
    paddingTop: 20,
  },
  scrollView: {
    flex: 1,
    paddingHorizontal: 16,
    paddingVertical: 24,
  },
  infoSection: {
    backgroundColor: '#18181B',
    padding: 16,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#27272A',
    marginBottom: 24,
  },
  infoHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  infoTitle: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '600',
    marginLeft: 12,
  },
  infoText: {
    color: '#A1A1AA',
    fontSize: 14,
    lineHeight: 20,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 16,
  },
  exportCard: {
    backgroundColor: '#18181B',
    padding: 20,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#27272A',
  },
  exportHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  exportInfo: {
    flex: 1,
    marginLeft: 16,
  },
  exportTitle: {
    color: '#FFFFFF',
    fontSize: 20,
    fontWeight: '700',
    marginBottom: 4,
  },
  exportDescription: {
    color: '#A1A1AA',
    fontSize: 14,
  },
  reportsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
  },
  reportCard: {
    flex: 1,
    backgroundColor: '#18181B',
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#27272A',
    alignItems: 'center',
    minHeight: 120,
  },
  reportTitle: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
    marginTop: 8,
    marginBottom: 4,
    textAlign: 'center',
  },
  reportDesc: {
    color: '#A1A1AA',
    fontSize: 12,
    textAlign: 'center',
    marginBottom: 12,
  },
  excelContainer: {
    gap: 16,
  },
  excelCard: {
    backgroundColor: '#18181B',
    padding: 16,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#27272A',
  },
  excelHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  excelTitle: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 12,
  },
  excelDesc: {
    color: '#A1A1AA',
    fontSize: 14,
    marginBottom: 16,
  },
  systemInfo: {
    backgroundColor: '#18181B',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#27272A',
    overflow: 'hidden',
  },
  systemItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#27272A',
  },
  systemItemText: {
    marginLeft: 12,
    flex: 1,
  },
  systemItemLabel: {
    color: '#A1A1AA',
    fontSize: 14,
  },
  systemItemValue: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
    marginTop: 2,
  },
  actionsContainer: {
    backgroundColor: '#18181B',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#27272A',
    overflow: 'hidden',
  },
  exitButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#1F1F23',
  },
  exitButtonContent: {
    marginLeft: 12,
    flex: 1,
  },
  exitButtonTitle: {
    color: '#EF4444',
    fontSize: 16,
    fontWeight: '600',
  },
  exitButtonDesc: {
    color: '#A1A1AA',
    fontSize: 14,
    marginTop: 2,
  },
  adminButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#1F1F23',
    borderBottomWidth: 1,
    borderBottomColor: '#27272A',
  },
  adminButtonContent: {
    marginLeft: 12,
    flex: 1,
  },
  adminButtonTitle: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  adminButtonDesc: {
    color: '#A1A1AA',
    fontSize: 14,
    marginTop: 2,
  },
});
